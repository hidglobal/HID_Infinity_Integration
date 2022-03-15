define([], function() {
  var globals ={};
  globals.startTime =0;
  globals.approveFlag = false;
  globals.approvePoll = false;
  var instance = null;
  
 
  const serviceTransactionConfig = {
    "serviceName": "HIDTransactionSigning",
    "accessType": {
      "access": "online"
    }
  };
  
  const HIDTransactionObjectServices = {
    getRepository: function(repoName) {
      var objSvc = kony.sdk.getCurrentInstance().getObjectService(serviceTransactionConfig.serviceName, serviceTransactionConfig.accessType);
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
  
  function BusinessController() {
  }

  BusinessController.getInstance = function() {
    instance = instance === null ? new BusinessController() : instance;
    return instance;
  };
  
  BusinessController.prototype.validateTransactionOTP = function(params, S_CB, F_CB) {
    let objService = HIDTransactionObjectServices.getRepository("SignatureValidation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateSignature", params, callback);
  };
  
  BusinessController.prototype.getPasswordPolicy = function(params, S_CB, F_CB) {
    let objService = HIDTransactionObjectServices.getRepository("PasswordPolicy");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("getPasswordPolicy", params, callback);
  };  
  
  return BusinessController.getInstance();
});