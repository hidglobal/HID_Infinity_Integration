define([], function() {
  var instance = null;
  const getLogTag = function(string){
    return "OnboardingBusinessController." + string;
  };
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

  function OnboardingBusinessController() {
  }

  OnboardingBusinessController.prototype.initiateApproveNotification = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("HIDApproveInitiation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("initiateApprove", params, callback);
  };

  OnboardingBusinessController.prototype.approveStatusPolling = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ApproveStatusPolling");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("approveStatusPolling", params, callback);
  };

  OnboardingBusinessController.prototype.deviceRegistrationPolling = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("DeviceRegistrationPolling");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("deviceRegistrationPolling", params, callback);
  };

  OnboardingBusinessController.prototype.validateActivatonCode = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ActivationCodeValidation");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateActivationCode", params, callback);
  };

  OnboardingBusinessController.prototype.getPasswordPolicy = function(params, S_CB, F_CB) {
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
  
  OnboardingBusinessController.prototype.addPasswordtoUser = function(params, S_CB, F_CB) {
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
  OnboardingBusinessController.prototype.addOOBToUser = function(params, S_CB, F_CB) {
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
  OnboardingBusinessController.prototype.sendOOB = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SendOOB");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("sendOOB", params, callback);
  };
  OnboardingBusinessController.prototype.validateOOB = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ValidateOOB");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("validateOOB", params, callback);
  };
  OnboardingBusinessController.prototype.approveDeviceRegistration = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("ApproveDeviceRegistration");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("getInviteCode", params, callback);
  };
  
  OnboardingBusinessController.prototype.addHardwareAuthenticator = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("AddHardwareAuthenticator");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("addHardwareAuthenticator", params, callback);
  };

    OnboardingBusinessController.prototype.searchHardwareDevice = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SearchHardwareDevice");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("searchHardwareDevice", params, callback);
  };
  
  
   OnboardingBusinessController.prototype.addHardwareDeviceToUser = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("AddHardwareDeviceToUser");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("addHardwareDeviceToUser", params, callback);
  };
  
  OnboardingBusinessController.getInstance = function() {
    instance = instance === null ? new OnboardingBusinessController() : instance;
    return instance;
  };
  return OnboardingBusinessController.getInstance();
});