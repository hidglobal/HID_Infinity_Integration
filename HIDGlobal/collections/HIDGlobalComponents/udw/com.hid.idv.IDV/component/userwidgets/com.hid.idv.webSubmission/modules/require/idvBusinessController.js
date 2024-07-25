define(function() {
  var instance = null;
  const serviceConfig = {
    "serviceName": "HID_IDV_Web_ObjectServices",
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
          for(let key in params) {
            dataObject.addField(key, params[key]);
          }
          var options = {
            "dataObject": dataObject
          };
          objSvc.customVerb(customVerb, options, success => {
            commonCallback(true, success);
          }, error => {
            commonCallback(false, error);
          });
        }
      };
    }
  };
  
  const HIDObjectServicesWithHeaders = {
    getRepository: function(repoName) {
      var objSvc = kony.sdk.getCurrentInstance().getObjectService(serviceConfig.serviceName, serviceConfig.accessType);
      return {
        customVerb: function(customVerb, params, commonCallback) {
          var dataObject = new kony.sdk.dto.DataObject(repoName);
          var options = {
             "dataObject" : dataObject,
             "headers": params
          };
          objSvc.customVerb(customVerb, options, success => {
            commonCallback(true, success);
          }, error => {
            commonCallback(false, error);
          });
        }
      };
    }
  };
  

  function idvBusinessController() {
  }

  idvBusinessController.prototype.sendLinkWithPhoneNo = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SendLinkWithPhoneNo");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.SendLinkWithPhoneNo[0]);
      } else {
        F_CB(response.SendLinkWithPhoneNo[0] || response);
      }
    };
    objService.customVerb("sendLink", params, callback);
  };
  
  idvBusinessController.prototype.sendLinkWithEmail= function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SendLinkWithEmail");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.SendLinkWithEmail[0]);
      } else {
        F_CB(response.SendLinkWithEmail[0] || response);
      }
    };
    objService.customVerb("sendLink", params, callback);
  };

   idvBusinessController.prototype.generateLinkForQRScan= function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("GenerateLinkForQRScan");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.GenerateLinkForQRScan[0]);
      } else {
        F_CB(response.GenerateLinkForQRScan[0] || response);
      }
    };
    objService.customVerb("generateLinkForQRScan", params, callback);
  };
  
  idvBusinessController.prototype.getSubmissionStatus = function(params, S_CB, F_CB) {
    let objService = HIDObjectServicesWithHeaders.getRepository("SubmissionStatus");
    const callback = (status, response) => {
//       alert(JSON.stringify(response));
      if (status) {
        S_CB(response.SubmissionStatus[0]);
      } else {
        F_CB(response.SubmissionStatus[0] || response);
      }
    };
    objService.customVerb("submissionStatus", params, callback);
  };
  //status by uid
  idvBusinessController.prototype.getSubmissionStatusUID = function(params, S_CB, F_CB) {
    let objService = HIDObjectServicesWithHeaders.getRepository("SubmissionStatusUID");
    const callback = (status, response) => {
//       alert(JSON.stringify(response));
      if (status) {
        S_CB(response.SubmissionStatus[0]);
      } else {
        F_CB(response.SubmissionStatus[0] || response);
      }
    };
    objService.customVerb("submissionStatusUID", params, callback);
  };
  
  idvBusinessController.prototype.getSubmissionDetails = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("SubmissionDetails");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("getDetails", params, callback);
  };
  
  idvBusinessController.prototype.getImages = function(params, S_CB, F_CB) {
    let objService = HIDObjectServices.getRepository("GetDocumentImages");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    objService.customVerb("documentImages", params, callback);
  };

  idvBusinessController.getInstance = function() {
    instance = instance === null ? new idvBusinessController() : instance;
    return instance;
  };
  return idvBusinessController.getInstance();
});