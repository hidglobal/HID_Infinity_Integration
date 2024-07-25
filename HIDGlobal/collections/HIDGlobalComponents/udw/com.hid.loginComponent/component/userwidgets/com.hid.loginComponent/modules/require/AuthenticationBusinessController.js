define(['com/hid/loginComponent/KonyLogger'], function (KonyLogger) {
  var konymp = konymp || {};
  konymp.logger = (new KonyLogger("HID Authentication Component")) || function () {};
  var globals ={};
  globals.startTime =0;
  globals.approveFlag = false;
  globals.approvePoll = false;
  globals.auth_req_id = "";
  globals.scan_auth_req_id = "";
  globals.scanApprovePoll = false;
  globals.ScanApproveFlag = false;

  var userName = "";
  var instance = null;
  var pollCounter = 2;
  var ScanToApprovePollCounter = 2;

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
    },
    getLoginPayloadFIDO: function(loginJSON) {
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
                      "request_uri": "${loginJSON.request_uri}",
                      "csrf": "${loginJSON.csrf}",
                      "password": {
                          "id": "${loginJSON.password.id}",
                          "response": {
                              "clientDataJSON": "${loginJSON.password.response.clientDataJSON}",
                              "authenticatorData": "${loginJSON.password.response.authenticatorData}",
                              "signature": "${loginJSON.password.response.signature}",
                              "userHandle": "${loginJSON.password.response.userHandle}"
                          }
                      }
                   }
           	   }`;
      }
  };   

  
  AuthenticationBusinessController.prototype.validatePassword = function(loginJson, S_CB, F_CB,rmsLoad=null){
    konymp.logger.trace("----------Entering validatePassword Function---------", konymp.logger.FUNCTION_ENTRY);
    
    this.authenticateFirstFactor(loginJson,"STATIC_PWD", S_CB, F_CB, rmsLoad);
    
    konymp.logger.trace("----------Exiting validatePassword Function---------", konymp.logger.FUNCTION_EXIT);
  };
  
  AuthenticationBusinessController.prototype.authenticateFirstFactor = function(loginJson,authType, S_CB, F_CB, rmsLoad=null){
    konymp.logger.trace("----------Entering authenticateFirstFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = {};
    if(authType == "FIDO"){
      loginPayload = SCAEventConstants.getLoginPayloadFIDO(loginJson);
    } else {
      loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    }
    if(rmsLoad){
      let obj = JSON.parse(loginPayload) ;
      obj.Meta.rmspayload = rmsLoad;
      loginPayload = JSON.stringify(obj);
    }
    var options = {
      "payload" : loginPayload,
      "authType":authType,
      "isMfa":true
    };

    identitySvc.login(options,
      success=>{
        var mfaDetails = identitySvc.getMfaDetails();
        konymp.logger.debug("authenticateFirstFactor Function success", konymp.logger.SUCCESS_CALLBACK);
        userName = loginJson.userid;
        S_CB(mfaDetails);
      },
      error=>{
        konymp.logger.debug("authenticateFirstFactor function error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);
        F_CB(error);
      });
    konymp.logger.trace("----------Exiting authenticateFirstFactor Function---------", konymp.logger.FUNCTION_EXIT);
  };

  AuthenticationBusinessController.prototype.updateRMSServiceEvent = function(authType, mfa_key, S_CB, F_CB,password){
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    var mfaParams = {
      "is_mfa_enabled": true,
      "mfa_meta": {
      },
      "authType" : authType,
      "password" : password,
      "mfa_key" : mfa_key
    };
    identitySvc.validateMfa(mfaParams, success => S_CB(success), error => F_CB(error));
  };

  AuthenticationBusinessController.prototype.authenticateSecondFactor = function(factor,password,mfa_key, S_CB, F_CB){
    konymp.logger.trace("----------Entering authenticateSecondFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    if(factor === "APPROVE" && !globals.approvePoll){
      globals.auth_req_id = password;
      pollCounter = 2;
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

  AuthenticationBusinessController.prototype.pollForConsensusOld = function(auth_req_id,factor,mfa_key,S_CB, F_CB){
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
              }else if(response.ApproveStatus[0].auth_status === "deny"){
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

  AuthenticationBusinessController.prototype.pollForConsensus = function(auth_req_id, factor,mfa_key, S_CB, F_CB){
    if (globals.auth_req_id !== auth_req_id) return;
    pollCounter--;
    const successCB = response => {
      if (globals.auth_req_id !== auth_req_id) return;
      pollCounter =2;
      if(response.ApproveStatus[0].auth_status === "accept"){
        this.authenticateApprove(factor,auth_req_id,mfa_key, S_CB, F_CB);
      }else if(response.ApproveStatus[0].auth_status === "deny"){
        konymp.logger.debug("Approve Notification status for authID : "+auth_req_id+ "is :"+response.ApproveStatus[0].auth_status, konymp.logger.ERROR_CALLBACK);
        F_CB(response.ApproveStatus[0].auth_status);
      }           
    };
    const failureCB =  error => {
      if (globals.auth_req_id !== auth_req_id) return;
      if(pollCounter <= 0){
        F_CB({"message":"Approve poll Time Expired"});
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
  
  AuthenticationBusinessController.prototype.scanToApproveFirstFactor = function(username,password,authType, S_CB, F_CB,rmsLoad=null){
    kony.print("Business Controller authtype "+ authType);
    konymp.logger.trace("----------Entering scanToApproveFirstFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    if(authType === "APPROVE" && !globals.scanApprovePoll){
      globals.scan_auth_req_id = password;
      ScanToApprovePollCounter = 2;
      this.pollForScanToApprove(username,password,authType, S_CB, F_CB,rmsLoad);
      return;
    }    
    globals.scanApprovePoll = false;
    konymp.logger.trace("----------Entering authenticateFirstFactor Function---------", konymp.logger.FUNCTION_ENTRY);
    var client = KNYMobileFabric;
    let transactionId = Math.floor(Math.random() * 10000);
    kony.print("username : "+ username);
    var loginJson = {
			"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                     "currentRiskScore" : "2", "transactionId" : transactionId
    }
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
	
    kony.print("RMSLOAD BUISNESS "+ JSON.stringify(rmsLoad))
    if(rmsLoad){
      let obj = JSON.parse(loginPayload) ;
      obj.Meta.rmspayload = rmsLoad;
      loginPayload = JSON.stringify(obj);
    }
    var options = {
      "payload" : loginPayload,
      "authType":authType,
      "isMfa":true
    };

    identitySvc.login(options,
      success=>{
        var mfaDetails = identitySvc.getMfaDetails();
        konymp.logger.debug("authenticateFirstFactor Function success", konymp.logger.SUCCESS_CALLBACK);
        userName = loginJson.userid;
        S_CB(mfaDetails,username);
      },
      error=>{
        konymp.logger.debug("authenticateFirstFactor function error : "+ JSON.stringify(error), konymp.logger.ERROR_CALLBACK);
        F_CB(error);
      });
    konymp.logger.trace("----------Exiting authenticateFirstFactor Function---------", konymp.logger.FUNCTION_EXIT);
  }
  
    AuthenticationBusinessController.prototype.pollForScanToApprove = function(username,auth_req_id, authType, S_CB, F_CB,rmsLoad=null){
    if (globals.scan_auth_req_id !== auth_req_id) return;
    ScanToApprovePollCounter--;
    const successCB = response => {
      if (globals.scan_auth_req_id !== auth_req_id) return;
      ScanToApprovePollCounter = 2;
      if(response.ApproveStatus[0].auth_status === "accept"){
        globals.scanApprovePoll = true;
      	username = response.ApproveStatus[0].usercode;
        this.scanToApproveFirstFactor(username,auth_req_id,authType, S_CB, F_CB,rmsLoad);
      }else if(response.ApproveStatus[0].auth_status === "deny"){
        konymp.logger.debug("Scan to Approve Notification status for authID : "+auth_req_id+ "is :"+response.ApproveStatus[0].auth_status, konymp.logger.ERROR_CALLBACK);
        F_CB(response.ApproveStatus[0].auth_status);
      }           
    };
    const failureCB =  error => {
      if (globals.scan_auth_req_id !== auth_req_id) return;
      if(ScanToApprovePollCounter <= 0){
        F_CB({"message":"Approve poll Time Expired"});
        ScanToApprovePollCounter = 2;
      } else{
        this.pollForScanToApprove(username,auth_req_id, authType, S_CB, F_CB,rmsLoad);
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

      otpRequestDataModel.customVerb("sendOTPLogin", params, callback); // Karthiga Changes
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
    let filteredResources = devices.filter(v => (v.type === "DT_TDSV4" || v.type === "DT_TDSV4B") && v.active);
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

  AuthenticationBusinessController.prototype.rmsSessionLogout = function(params, S_CB, F_CB) {
    let rmsObjService = RMSObjectServices.getDataModel("RMSSessionService");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("sessionLogout", params, callback);
  };
  
   AuthenticationBusinessController.prototype.getClientIp = function(S_CB, F_CB) {
    let getClientIp = ObjectServices.getDataModel("GetClientIp");
    const callback = (status,response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    getClientIp.customVerb("getClientIp", "" , callback);
  };
  
  AuthenticationBusinessController.prototype.getClientIpScanToApprove = function(qrDataResponse,S_CB, F_CB) {
    let getClientIp = ObjectServices.getDataModel("GetClientIp");
    const callback = (status,response) => {
      if (status) {
        S_CB(qrDataResponse,response);
      } else {
        F_CB(qrDataResponse,response);
      }
    };
    getClientIp.customVerb("getClientIp", "" , callback);
  };
  
  AuthenticationBusinessController.prototype.getScanToApproveQrData = function(S_CB,F_CB){
    
    let getScanToApproveQrData = ObjectServices.getDataModel("getScanToApproveQrData");
    const callback = (status,response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    getScanToApproveQrData.customVerb("getScanToApproveQrData", "" , callback);

  }
    
  AuthenticationBusinessController.prototype.getFIDOAuthenticationOptions
  	= function(params, S_CB, F_CB)
  {
    let objSvc = ObjectServices.getDataModel("FIDOAuthentication");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    
    objSvc.customVerb("getAuthenticationOptions", params, callback);
  }
  
  AuthenticationBusinessController.prototype.authenticateFIDO
  	= function(params, S_CB, F_CB)
  {
    let objSvc = ObjectServices.getDataModel("FIDOAuthentication");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    
    objSvc.customVerb("authenticate", params, callback);
  }

  function AuthenticationBusinessController() {

  }

  AuthenticationBusinessController.getInstance = function() {
    instance = instance === null ? new AuthenticationBusinessController() : instance;
    return instance;
  };

  return AuthenticationBusinessController.getInstance();
});
