define(['com/hid/rms/nonFinancialComponent/KonyLogger'],function (KonyLogger) {
    var konymp = konymp || {};
  konymp.logger = (new KonyLogger("HID Non-Financial Component")) || function () {};
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
  
  const RMSObjectServiceName = {
    "name" : "HIDRMSService",
    "accessType" : {"access" : "online"}
  };
  
   const RMSObjectServices = {
    getDataModel : function (objectName){
      var objectInstance = KNYMobileFabric.getObjectService(RMSObjectServiceName.name,RMSObjectServiceName.accessType );
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
  
  const UserManagementObjectName = {
    "name" : "HIDUserManagement",
    "accessType" : {"access" : "online"}
  };
  
   const UserManagementObjectServices = {
    getDataModel : function (objectName){
      var objectInstance = KNYMobileFabric.getObjectService(UserManagementObjectName.name,UserManagementObjectName.accessType );
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

  NonFinancialBusinessController.prototype.validatePassword = function(loginJson, S_CB, F_CB,rmsLoad=null){
    konymp.logger.trace("----------Entering validatePassword Function---------", konymp.logger.FUNCTION_ENTRY);
    var client = KNYMobileFabric;
    var serviceName = "customHIDLoginWithoutMFA";//"customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);

    if(rmsLoad){
      let obj = JSON.parse(loginPayload) ;
      obj.Meta.rmspayload = rmsLoad;
      loginPayload = JSON.stringify(obj);
      }
    var options = {
      "payload" : loginPayload,
      "authType":"STATIC_PWD",
      "isMfa":false
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
  
  NonFinancialBusinessController.prototype.authenticateSecondFactor = function(username,factor,password,mfa_key, S_CB, F_CB){
    konymp.logger.trace("----------Entering authenticateSecondFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    if(factor === "APPROVE" && !globals.approvePoll){      
      this.pollForConsensus(username,password,mfa_key, S_CB, F_CB);
      return;
    }    
    globals.approvePoll = false;
    var client = KNYMobileFabric;
    let transactionId = Math.floor(Math.random()*10000000);
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                     "currentRiskScore" : "2", "transactionId" : transactionId};
    var serviceName = "customHIDLoginWithoutMFA";
    var identitySvc = client.getIdentityService(serviceName);     
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    var options = {
      "payload" : loginPayload,
      "authType":factor,
      "isMfa":false
    };
    identitySvc.login(options, 
                      success => S_CB(success),
                      error => {
      konymp.logger.debug("authenticateSecondFactor function error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);      
      F_CB(error);
    }
                     );
    konymp.logger.trace("----------Exiting authenticateSecondFactor Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  NonFinancialBusinessController.prototype.initiateApproveNotification = function(params, S_CB, F_CB){
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
  
  NonFinancialBusinessController.prototype.pollForConsensus = function(username,auth_req_id, mfa_key, S_CB, F_CB){
     pollCounter--;
    const successCB = response => {
          pollCounter =2;
          if(response.ApproveStatus[0].auth_status === "accept"){
            this.authenticateApprove(username,auth_req_id,mfa_key, S_CB, F_CB);
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
        this.pollForConsensus(username,auth_req_id, mfa_key, S_CB, F_CB);
      }
    };
    var params = {
          "mfa_key": auth_req_id
    };
    this.approveStatusPolling(params, successCB, failureCB)
  };
  
  NonFinancialBusinessController.prototype.approveStatusPolling = function(params, S_CB, F_CB) {
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
     

  NonFinancialBusinessController.prototype.authenticateApprove = function(username,password,mfa_key, S_CB, F_CB){
     globals.approvePoll = true;
     this.authenticateSecondFactor(username,"APPROVE",password, mfa_key, S_CB, F_CB);  
  };

  NonFinancialBusinessController.prototype.sendOTP = function(params, S_CB, F_CB){
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
  NonFinancialBusinessController.prototype.getApproveDevices = function(params, S_CB, F_CB){
    konymp.logger.trace("----------Entering getApproveDevices Function---------", konymp.logger.FUNCTION_ENTRY);
    try {
     // var deviceDataModel = ObjectServices.getDataModel("Devices");
      var deviceDataModel = UserManagementObjectServices.getDataModel("SearchDevices");
      const callback = (status, response) => {
        if (status){
          if(response.SearchDevices.length > 0)
          {
            var devices = this.fetchFriendlyName(response.SearchDevices);            
            S_CB(devices);           
          } else {
            konymp.logger.debug("User has no device", konymp.logger.ERROR_CALLBACK);
            F_CB({"errorMsg" : "User has no device"});            
          }
        } else {
          konymp.logger.debug("Error occurred while calling service to get approve devices, response : "+JSON.stringify(response), konymp.logger.ERROR_CALLBACK);
          F_CB(response);}
      };
      deviceDataModel.customVerb("SearchDevices", params, callback);
      konymp.logger.trace("----------Exiting getApproveDevices Function---------", konymp.logger.FUNCTION_EXIT);
    } catch (exception) {
      konymp.logger.error("Exception in getApproveDevices function : " + exception.message, konymp.logger.EXCEPTION);  
    }        
  };

  NonFinancialBusinessController.prototype.fetchFriendlyName = function(devices){
    let filteredResources = devices.filter(v => (v.type === "DT_TDSV4" || v.type === "DT_TDSV4B") && v.active);
    let friendlyNames = [];
    let tempJson = {};
    filteredResources.forEach(v => {
      tempJson = {"deviceId":v.deviceId,"friendlyName":v.friendlyName};
      friendlyNames.push(tempJson); });
    return friendlyNames;
  };
  
  NonFinancialBusinessController.prototype.cancelApprovePolling = function(){
    konymp.logger.trace("----------Entering cancelApprovePolling Function---------", konymp.logger.FUNCTION_ENTRY);
    globals.approveFlag = true;
    kony.timer.cancel("hidtimer");
    konymp.logger.trace("----------Exiting cancelApprovePolling Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  NonFinancialBusinessController.prototype.logout = function(S_CB, F_CB){
    konymp.logger.trace("----------Entering logout Function---------", konymp.logger.FUNCTION_ENTRY);
    var serv = "customHIDLogin";
    var identitySrv = KNYMobileFabric.getIdentityService(serv);
    identitySrv.logout(success=>S_CB(success), error=>{
      konymp.logger.debug("Error occurred while logout, error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);
      F_CB(error);
    });
    konymp.logger.trace("----------Exiting logout Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  NonFinancialBusinessController.prototype.rmsActionCreate = function(params, S_CB, F_CB) {
    let rmsObjService = RMSObjectServices.getDataModel("RMSActionCreate");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.RMSActionCreate[0]);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("rmsActionCreate", params, callback);
  };
  
  NonFinancialBusinessController.prototype.rmsActionSign = function(params, S_CB, F_CB) {
    let rmsObjService = RMSObjectServices.getDataModel("RMSActionSign");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.RMSActionSign[0]);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("rmsActionSign", params, callback);
  };
  
  NonFinancialBusinessController.prototype.rmsActionComplete = function(action_status,params, S_CB, F_CB) {
    let customVerb = action_status ? "rmsActionComplete" : "rmsActionReject";
    let rmsObjService = RMSObjectServices.getDataModel("RMSActionComplete");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb(customVerb, params, callback);
  };
  
  /*
  Change password flow with MFA: static password
  Validate the password
  */
  NonFinancialBusinessController.prototype.validatePasswordforChangePwd = function(params, S_CB, F_CB) {
    let objectServices = ObjectServices.getDataModel("ValidatePassword");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objectServices.customVerb("validatePassword", params, callback);
  };  
  
  /*
  Change password flow with 2nd factor MFA: OTP_SMS
  Validate the OTP
  */
  NonFinancialBusinessController.prototype.validateOTPforChangePwd = function(params, S_CB, F_CB) {
    let objectServices = ObjectServices.getDataModel("ValidateOTP");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objectServices.customVerb("validateOtp", params, callback);
  };
  
   function NonFinancialBusinessController() {
  }

  NonFinancialBusinessController.getInstance = function() {
    instance = instance === null ? new NonFinancialBusinessController() : instance;
    return instance;
  };

  return NonFinancialBusinessController.getInstance();
  
});