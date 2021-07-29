define(['com/hid/loginComponent/KonyLogger'], function (KonyLogger) {
  var konymp = konymp || {};
  konymp.logger = (new KonyLogger("HID Authentication Component")) || function () {};
  var globals ={};
  globals.startTime =0;
  globals.approveFlag = false;
  globals.approvePoll = false;
  var userName = "";
  var instance = null;
  var pollCounter = 2;
  
  const objectServiceName = {
    "name" : "HIDAuthService",
    "accessType" : {"access" : "online"}
  };

  const ObjectServices = {
    getDataModel : function (objectName){
      var objectInstance = KNYMobileFabric.getObjectService(objectServiceName.name,objectServiceName.accessType );
      return {
        customVerb : function(customVerb, params, callback) {
          var dataObject = new kony.sdk.dto.DataObject(objectName);         
          for (let key in params){
            dataObject.addField(key, params[key]);
          }          
          var options = { "dataObject" : dataObject};
          objectInstance.customVerb(customVerb, options, success => callback(true, success), error => callback(false, error));
        }
      };
    }
  };
  
  const SCAEventConstants = {
        getLoginPayload: function(loginJSON) {
            // Using ES6 Template Literal
            return `{
                  "Meta": {
                      "EventType": "urn:com:temenos:security:event:login:v1",  
                      "RiskScore": {
                          "Required": "${loginJSON.requiredRiskScore}",
                          "Current": "${loginJSON.currentRiskScore}"
                      },
                      "TransactionId": "${loginJSON.transactionId}"
                  },
                  "urn:com:temenos:security:event:login:v1": {
                      "Scope": "LOGIN" ,
                      "Name": "Temenos Internet Banking",
                      "userid": "${loginJSON.userid}",
                      "password": "${loginJSON.password}"
                  }
            }`;
        }
    };   

  AuthenticationBusinessController.prototype.validatePassword = function(loginJson, S_CB, F_CB){
    konymp.logger.trace("----------Entering validatePassword Function---------", konymp.logger.FUNCTION_ENTRY);
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    var options = {
      "payload" : loginPayload,
      "authType":"STATIC_PWD",
      "isMfa":true
    };

    identitySvc.login(options,
                      success=>{
      var mfaDetails = identitySvc.getMfaDetails();
      konymp.logger.debug("validatePassword Function success", konymp.logger.SUCCESS_CALLBACK);
      userName = loginJson.userid;
      S_CB(mfaDetails);
      
    },
                      error=>{
      konymp.logger.debug("validatePassword function error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);
      F_CB(error);
    }
                     );
    konymp.logger.trace("----------Exiting validatePassword Function---------", konymp.logger.FUNCTION_EXIT);
  };
  AuthenticationBusinessController.prototype.authenticateSecondFactor = function(factor,password,mfa_key, S_CB, F_CB){
    konymp.logger.trace("----------Entering authenticateSecondFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    if(factor === "APPROVE" && !globals.approvePoll){      
      this.pollForConsensus(password,"second",mfa_key, S_CB, F_CB);
      return;
    }    
    globals.approvePoll = false;
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);     
    var mfaParams = {
      "is_mfa_enabled": true,
      "mfa_meta": {
      },
      "mfa_key" :mfa_key,
      "password":password,
      "authType":factor,
      "userName": userName
    };
    identitySvc.validateMfa(mfaParams, 
                            success => S_CB(success),
                            error => {
      konymp.logger.debug("authenticateSecondFactor function error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);      
      F_CB(error);
    }
                           );
    konymp.logger.trace("----------Exiting authenticateSecondFactor Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  AuthenticationBusinessController.prototype.initiateApproveNotification = function(params, S_CB, F_CB){
    konymp.logger.trace("----------Entering initiateApprove Function---------", konymp.logger.FUNCTION_ENTRY);
    globals.approveFlag = false;
    try {
      var approveDataModel = ObjectServices.getDataModel("ApproveRequest");
      const callback = (status, response) => {
        if(status) {          
          S_CB(response.ApproveRequest[0]);
        } else {
          konymp.logger.debug("inititateApproveNotification function error : "+ JSON.stringify(response), konymp.logger.ERROR_CALLBACK);
          F_CB(response);
        }
      };       
      
      approveDataModel.customVerb("initiate",params, callback);
      konymp.logger.trace("----------Exiting initiateApprove Function---------", konymp.logger.FUNCTION_EXIT);
    } 
    catch (exception) {
      konymp.logger.error("Exception in initiateApproveNotification function : " + exception.message, konymp.logger.EXCEPTION);
    }  
  };
  
  AuthenticationBusinessController.prototype.pollForConsensus = function(auth_req_id,factor,mfa_key,S_CB, F_CB){
    konymp.logger.trace("----------Entering pollForConsensus Function---------", konymp.logger.FUNCTION_ENTRY);
    globals.startTime = new Date().getTime();
    var self =this;
    poll();
    kony.timer.schedule("hidtimer",poll, 60, true);
    function poll() {
      try{
        var approveStatusDataModel = ObjectServices.getDataModel("ApproveStatus");
        const callback = (status, response) => {
          if (status){
            if (response.ApproveStatus[0].auth_status === "accept" || response.ApproveStatus[0].auth_status === "deny") {
              if(globals.approveFlag ){
                globals.approveFlag = false;
                return;
              }
              globals.approveFlag = true;
              kony.timer.cancel("hidtimer");
              if(response.ApproveStatus[0].auth_status === "accept"){
                self.authenticateApprove(factor,auth_req_id,mfa_key, S_CB, F_CB);
              }else{
                konymp.logger.debug("Approve Notification status for authID : "+auth_req_id+ "is :"+response.ApproveStatus[0].auth_status, konymp.logger.ERROR_CALLBACK);
                F_CB(response.ApproveStatus[0].auth_status);
              }
            }
          }else {
            var currentTime = new Date().getTime();
            if (currentTime - globals.startTime > 117000) {
              globals.approveFlag = true;
              kony.timer.cancel("hidtimer");              
              konymp.logger.debug("Timed out while polling for Approve notification status", konymp.logger.ERROR_CALLBACK);
              F_CB({"message":"Approve poll Time Expired"});
            }            
          }
        };

        var params = {
          "mfa_key": auth_req_id
        };
        approveStatusDataModel.customVerb("poll",params, callback);
      }
      catch (exception){
        konymp.logger.error("Exception in polling for Approve status : " + exception.message, konymp.logger.EXCEPTION);
      }
    }
    konymp.logger.trace("----------Exiting pollForConsensus Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  AuthenticationBusinessController.prototype.pollForConsensus = function(auth_req_id, factor, mfa_key, S_CB, F_CB){
     pollCounter--;
    const successCB = response => {
          pollCounter =2;
          if(response.ApproveStatus[0].auth_status === "accept"){
            this.authenticateApprove(factor,auth_req_id,mfa_key, S_CB, F_CB);
          }else{
            konymp.logger.debug("Approve Notification status for authID : "+auth_req_id+ "is :"+response.ApproveStatus[0].auth_status, konymp.logger.ERROR_CALLBACK);
            F_CB(response.ApproveStatus[0].auth_status);
          }           
    };
    const failureCB =  error => {
      if(pollCounter <= 0){
        F_CB("UNKNOWN");
        pollCounter = 2;
      } else{
        this.pollForConsensus(auth_req_id, factor, mfa_key, S_CB, F_CB);
      }
    };
    var params = {
          "mfa_key": auth_req_id
    };
    this.approveStatusPolling(params, successCB, failureCB)
  };
  
  AuthenticationBusinessController.prototype.approveStatusPolling = function(params, S_CB, F_CB) {
    let objService = ObjectServices.getDataModel("ApproveStatus");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("poll", params, callback);
  };
     

  AuthenticationBusinessController.prototype.authenticateApprove = function(factor,password,mfa_key, S_CB, F_CB){
    globals.approvePoll = true;
    if(factor === "second"){
      this.authenticateSecondFactor("APPROVE",password, mfa_key, S_CB, F_CB);  
    }/*else{
      this.authenticateWithoutMFA("APPROVE", globals.username, password);
    }*/
  };

  AuthenticationBusinessController.prototype.sendOTP = function(params, S_CB, F_CB){
    konymp.logger.trace("----------Entering sendOTP Function---------", konymp.logger.FUNCTION_ENTRY);
    try {
      var otpRequestDataModel = ObjectServices.getDataModel("OTPRequest");
      const callback = (status, response) => {
        if(status){
          if(response.OTPRequest[0].OTP_SENT){
            S_CB(response);
          }
          else { 
            konymp.logger.debug("Failed to send OTP to user, response : "+JSON.stringify(response), konymp.logger.ERROR_CALLBACK);
            F_CB(response);}
        } else {
          konymp.logger.debug("Error occurred while calling service to send OTP, response : "+JSON.stringify(response), konymp.logger.ERROR_CALLBACK);
          F_CB(response);
        }
      };

      otpRequestDataModel.customVerb("sendOTP", params, callback);
      konymp.logger.trace("----------Exiting sendOTP Function---------", konymp.logger.FUNCTION_EXIT);
    } catch (exception) {
      konymp.logger.error("Exception in sendOTP function : " + exception.message, konymp.logger.EXCEPTION);       
    }      
  };
  AuthenticationBusinessController.prototype.getApproveDevices = function(params, S_CB, F_CB){
    konymp.logger.trace("----------Entering getApproveDevices Function---------", konymp.logger.FUNCTION_ENTRY);
    try {
      var deviceDataModel = ObjectServices.getDataModel("Devices");
      const callback = (status, response) => {
        if (status){
          if(response.Devices.length > 0)
          {
            var devices = this.fetchFriendlyName(response.Devices);            
            S_CB(devices);           
          } else {
            konymp.logger.debug("User has no device", konymp.logger.ERROR_CALLBACK);
            F_CB({"errorMsg" : "User has no device"});            
          }
        } else {
          konymp.logger.debug("Error occurred while calling service to get approve devices, response : "+JSON.stringify(response), konymp.logger.ERROR_CALLBACK);
          F_CB(response);}
      };
      deviceDataModel.customVerb("searchDevices", params, callback);
      konymp.logger.trace("----------Exiting getApproveDevices Function---------", konymp.logger.FUNCTION_EXIT);
    } catch (exception) {
      konymp.logger.error("Exception in getApproveDevices function : " + exception.message, konymp.logger.EXCEPTION);  
    }        
  };

  AuthenticationBusinessController.prototype.fetchFriendlyName = function(devices){
    let filteredResources = devices.filter(v => v.type === "DT_TDSV4" && v.active);
    let friendlyNames = [];
    let tempJson = {};
    filteredResources.forEach(v => {
      tempJson = {"deviceId":v.deviceId,"friendlyName":v.friendlyName};
      friendlyNames.push(tempJson); });
    return friendlyNames;
  };
  
  AuthenticationBusinessController.prototype.cancelApprovePolling = function(){
    konymp.logger.trace("----------Entering cancelApprovePolling Function---------", konymp.logger.FUNCTION_ENTRY);
    globals.approveFlag = true;
    kony.timer.cancel("hidtimer");
    konymp.logger.trace("----------Exiting cancelApprovePolling Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  AuthenticationBusinessController.prototype.logout = function(S_CB, F_CB){
    konymp.logger.trace("----------Entering logout Function---------", konymp.logger.FUNCTION_ENTRY);
    var serv = "customHIDLogin";
    var identitySrv = KNYMobileFabric.getIdentityService(serv);
    identitySrv.logout(success=>S_CB(success), error=>{
      konymp.logger.debug("Error occurred while logout, error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);
      F_CB(error);
    });
    konymp.logger.trace("----------Exiting logout Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  function AuthenticationBusinessController() {

  }

  AuthenticationBusinessController.getInstance = function() {
    instance = instance === null ? new AuthenticationBusinessController() : instance;
    return instance;
  };

  return AuthenticationBusinessController.getInstance();
});