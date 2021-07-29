define([], function() {
  var instance = null;
  const getLogTag = function(string){
    return "transactionSigningBusinessController." + string;
  };
  const serviceConfig = {
    "serviceName": "HIDTransactionSigning",
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

  function transactionSigningBusinessController() {
  }

  transactionSigningBusinessController.prototype.approveTransactInitiate = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("AprroveTransactInitiate");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("aprroveTransactInitiate", params, callback);
  };
  transactionSigningBusinessController.prototype.OfflineTS = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SignatureValidation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateSignature", params, callback);
  };
  transactionSigningBusinessController.prototype.generateChallenge = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("GenerateChallenge");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("generateChallenge", params, callback);
  };
  transactionSigningBusinessController.prototype.validateChallenge = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ChallengeValidation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateChallenge", params, callback);
  };  
  transactionSigningBusinessController.prototype.approveStatusPolling = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ApproveStatus");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("poll", params, callback);
  };
  
   transactionSigningBusinessController.prototype.sendSMSOTP = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SendTXOOBSMS");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("sendTXOOBSMS", params, callback);
  };
  
  transactionSigningBusinessController.prototype.validateSMSOTP = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ValidateSMSOTP");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateSMSOTP", params, callback);
  };  
  
  transactionSigningBusinessController.getInstance = function() {
    instance = instance === null ? new transactionSigningBusinessController() : instance;
    return instance;
  };
  return transactionSigningBusinessController.getInstance();
});