define([], function() {
  var globals ={};
  globals.startTime =0;
  globals.approveFlag = false;
  globals.approvePoll = false;
  var instance = null;
  var msgId = "";
  const HIDAuthServiceConfig = {
    "name" : "HIDAuthService",
    "accessType" : {"access" : "online"}
  };
  const serviceConfig = {
    "serviceName": "HIDObjects",
    "accessType": {
      "access": "online"
    }
  };
  const RMSObjectServiceName = {
    "name" : "HIDRMSService",
    "accessType" : {"access" : "online"}
  };
  
  const RMSObjectServices = {
    getRepository: function(repoName) {
      var objSvc = kony.sdk.getCurrentInstance().getObjectService(RMSObjectServiceName.name, RMSObjectServiceName.accessType);
      return {
        customVerb : function(customVerb, params, callback) {
          var dataObject = new kony.sdk.dto.DataObject(repoName);         
          for (let key in params){
            dataObject.addField(key, params[key]);
          }          
          var options = { "dataObject" : dataObject};
          objSvc.customVerb(customVerb, options, success => callback(true, success), error => callback(false, error));
        }
      };
    }
  };
  
  const HIDObjectServices = {
    getRepository: function(repoName) {
      var objSvc = kony.sdk.getCurrentInstance().getObjectService(serviceConfig.serviceName, serviceConfig.accessType);
      return {
        customVerb: function(customVerb, params, commonCallback) {
          var dataObject = new kony.sdk.dto.DataObject(repoName);
          //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " params: "+JSON.stringify(params)));
          for (let key in params) {
            dataObject.addField(key, params[key]);
          }
          var options = {
            "dataObject": dataObject
          };
          objSvc.customVerb(customVerb, options, success => {
            //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " Response: "+JSON.stringify(success)));
            commonCallback(true, success);
          }, error => {
            //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " Error: "+JSON.stringify(error)));
            commonCallback(false, error);
          });
        }
      };
    }
  };
  
  const HIDAuthService = {
    getRepository: function(repoName) {
      var objSvc = kony.sdk.getCurrentInstance().getObjectService(HIDAuthServiceConfig.name, HIDAuthServiceConfig.accessType);
      return {
        customVerb: function(customVerb, params, commonCallback) {
          var dataObject = new kony.sdk.dto.DataObject(repoName);
          //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " params: "+JSON.stringify(params)));
          for (let key in params) {
            dataObject.addField(key, params[key]);
          }
          var options = {
            "dataObject": dataObject
          };
          objSvc.customVerb(customVerb, options, success => {
            //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " Response: "+JSON.stringify(success)));
            commonCallback(true, success);
          }, error => {
            //kony.web.logger("debug", getLogTag("CustomVerb:"+customVerb + " Error: "+JSON.stringify(error)));
            commonCallback(false, error);
          });
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
                      "password": "${loginJSON.password}",
                      "correlationId": "${loginJSON.correlationId}"
                  }
            }`;
        }
    }; 
  
  function BusinessController() {
  }

  BusinessController.prototype.validateActivatonCode = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ActivationCodeValidation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.ActivationCodeValidation[0]);
      } else {
        F_CB(response.ActivationCodeValidation[0]);
      }
    };
    objService.customVerb("validateActivationCode", params, callback);
  };

  BusinessController.prototype.setStandardPassword = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("AddPasswordAuthenticator");
    const callback = (status, response) => {
      if (status) {
//         alert("StandardPassword:"+JSON.stringify(response));
        kony.print("StandardPassword:"+JSON.stringify(response));
        S_CB(response);
      } else {
//         alert("StandardPassword false:"+JSON.stringify(response));
        kony.print("StandardPassword false:"+JSON.stringify(response));
        F_CB(response);
      }
    };
    objService.customVerb("addPasswordAuthenticator", params, callback);
  };
  
  BusinessController.prototype.getPasswordPolicy = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("PasswordPolicy");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("getPasswordPolicy", params, callback);
  };
  
  BusinessController.prototype.addPasswordtoUser = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("AddPasswordAuthenticator");
    const callback = (status, response) => {
      //       alert("business controller addPasswordtoUser response " + status);
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("addPasswordAuthenticator", params, callback);
  };
  
  BusinessController.getInstance = function() {
    instance = instance === null ? new BusinessController() : instance;
    return instance;
  };
  
  BusinessController.prototype.approveDeviceRegistration = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ApproveDeviceRegistration");
    const callback = (status, response) => {
      kony.print("HID => Inside businessController.approveDeviceRegistration");
      kony.print("HID => approveDeviceRegistration status : "+status+" and response : "+JSON.stringify(response));
      if (status) {
        S_CB(response.ApproveDeviceRegistration[0]);
      } else {
        F_CB(response.ApproveDeviceRegistration[0]);
      }
    };
    objService.customVerb("getInviteCodeTDSV4B", params, callback);
  };
  // Validate Secure OTP with RMS
  BusinessController.prototype.validateSecureOTPWithRMS = function(username, password, correlationId ,S_CB, F_CB,rmsLoad=""){
    let transactionId = Math.floor(Math.random() * 10000);    
    msgId = transactionId;
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                    "currentRiskScore" : "2", "transactionId" : transactionId, "correlationId": correlationId};    
    
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    
	if(rmsLoad){
      let obj = JSON.parse(loginPayload) ;
      obj.Meta.rmspayload = rmsLoad;
      loginPayload = JSON.stringify(obj);
    }
    var options = {
      "payload" : loginPayload,
      "authType":"SECURE_CODE"
    };

    identitySvc.login(options, success=>{
         var mfaDetails = identitySvc.getMfaDetails();
         userName = loginJson.userid;
         S_CB(mfaDetails);
      },error=>{
         F_CB(error);
    });};  
  
  BusinessController.prototype.validateSecureOTP = function(username, password, correlationId, S_CB, F_CB){
    let transactionId = Math.floor(Math.random() * 10000);    
    msgId = transactionId;
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                    "currentRiskScore" : "2", "transactionId" : transactionId,"correlationId":correlationId};    
    
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    
    var options = {
      "payload" : loginPayload,
      "authType":"SECURE_CODE"
    };

    identitySvc.login(options, success=>{
          var mfaDetails = identitySvc.getMfaDetails();
          userName = loginJson.userid;
           S_CB(mfaDetails);
      },error=>{
         F_CB(error);
    });}; 
  
  //Search User
BusinessController.prototype.searchUser = function(params, S_CB, F_CB) {
    kony.print("RMS => Inside businessController.searchUser");
    let objService = HIDAuthService.getRepository("SearchUser");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("searchUser", params, callback);
  };

//Add OOBAuthenticator
BusinessController.prototype.addOOBToUser = function(params, S_CB, F_CB) {
    kony.print("RMS => Inside businessController.addOOBToUser");
    let objService = HIDObjectServices.getRepository("AddOOBAuthenticator");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("addOOBAuthenticator", params, callback);
  };
  
//Send OOB/OTP Authenticator  
BusinessController.prototype.sendOOB = function(params, S_CB, F_CB){
    try {
      kony.print("RMS => Inside businessController.sendOOB");
      params.msgId = msgId;
      var otpRequestDataModel = HIDAuthService.getRepository("OTPRequest");
      const callback = (status, response) => {
        kony.print("RMS => CallbackStatus :"+status);
        if(status){
          if(response.OTPRequest[0].OTP_SENT){
            S_CB(response);
          }
          else { 
            F_CB(response);}
        } else {
          F_CB(response);
        }
      };
   //   otpRequestDataModel.customVerb("sendOTP", params, callback); // Existing Object service
      otpRequestDataModel.customVerb("sendOTPLogin", params, callback); // New Object service for Security fix
    } catch (exception) {      
    }      
  };
  
//Second factor Authenticator    
BusinessController.prototype.authenticateSecondFactor = function(username,factor,password,mfa_key,correlationId,S_CB, F_CB){
    kony.print("RMS => Inside businessController.authenticateSecondFactor");
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
      "userName": username,
      "correlationId": correlationId
    };
    identitySvc.validateMfa(mfaParams, 
                            success => S_CB(success),
                            error => {      
                                       F_CB(error);
                                     });
    };
  BusinessController.prototype.updateRMSServiceEvent = function(authType, mfa_key, S_CB, F_CB){
    kony.print("RMS => Inside businessController.updateRMSServiceEvent");
    var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    var mfaParams = {
      "is_mfa_enabled": true,
      "mfa_meta": {
      },
      "authType" : authType,
      "password" : "123456",
      "mfa_key" : mfa_key
    };
    identitySvc.validateMfa(mfaParams, success => S_CB(success), error => F_CB(error));
  };
  BusinessController.prototype.logout = function(S_CB, F_CB){
    kony.print("----------Entering logout Function---------");
    var serv = "customHIDLogin";
    var identitySrv = KNYMobileFabric.getIdentityService(serv);
    identitySrv.logout(success=>S_CB(success), error=>{
      kony.print("Error occurred while logout, error : "+ JSON.stringify(error));
      F_CB(error);
    });
    kony.print("----------Exiting logout Function---------");
  };

  BusinessController.prototype.rmsSessionLogout = function(params, S_CB, F_CB) {
    kony.print("RMS => Inside businessController.rmsSessionLogout with Params : "+ JSON.stringify(params));
    let rmsObjService = RMSObjectServices.getRepository("RMSSessionService");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("sessionLogout", params, callback);
  };
  
  
  return BusinessController.getInstance();
});
