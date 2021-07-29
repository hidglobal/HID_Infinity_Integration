define([], function() {
  var globals ={};
  globals.startTime =0;
  globals.approveFlag = false;
  globals.approvePoll = false;
  var instance = null;
  
  var instance = null;
  const serviceConfig = {
    "serviceName": "HIDObjects",
    "accessType": {
      "access": "online"
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
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("getInviteCodeTDSV4B", params, callback);
  };
  
  BusinessController.prototype.validateSecureOTP = function(username, password, S_CB, F_CB){
    let transactionId = Math.floor(Math.random() * 10000);    
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                    "currentRiskScore" : "2", "transactionId" : transactionId};    
    
       var client = KNYMobileFabric;
    var serviceName = "customHIDLogin";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    var options = {
      "payload" : loginPayload,
      "authType":"SECURE_CODE",
      "isMfa":false
    };

    identitySvc.login(options, success=>{
         //var mfaDetails = identitySvc.getMfaDetails();
         //userName = loginJson.userid;
         S_CB();
      },error=>{
         F_CB(error);
    });};  

  
  return BusinessController.getInstance();
});
