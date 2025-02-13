define([], function() {
  var instance = null;
  var deviceType = "DT_TDSV4B"; 
  const getLogTag = function(string){
    return "txnSigningBusinessController." + string;
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
  
//   const objectService = {
//     "name" : "HIDAuthService",
//     "accessType" : { "access" : "online"}
//   };
  
//   const HidObjectAuthServices = {
//      getDataModel : function (objectName){
//       var objectInstance = KNYMobileFabric.getObjectService(objectService.name,objectService.accessType );
//       return {
//         customVerb : function(customVerb, params, callback) {
//           var dataObject = new kony.sdk.dto.DataObject(objectName);         
//           for (let key in params){
//             dataObject.addField(key, params[key]);
//           }          
//           var options = { "dataObject" : dataObject};
//           objectInstance.customVerb(customVerb, options, success => callback(true, success), error => callback(false, error));
//         }
//       };
//     }
//   };

  function txnSigningBusinessController() {
  }

  txnSigningBusinessController.prototype.approveTransactInitiate = function(params, S_CB, F_CB) {
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
  txnSigningBusinessController.prototype.validateOfflineOTP = function(params, S_CB, F_CB) {
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
  txnSigningBusinessController.prototype.generateChallenge = function(params, S_CB, F_CB) {
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
  txnSigningBusinessController.prototype.validateChallenge = function(params, S_CB, F_CB) {
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
  txnSigningBusinessController.prototype.approveStatusPolling = function(params, S_CB, F_CB) {
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
  
   txnSigningBusinessController.prototype.sendSMSOTP = function(params, S_CB, F_CB) {
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
  
  txnSigningBusinessController.prototype.validateSMSOTP = function(params, S_CB, F_CB) {
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
  
  txnSigningBusinessController.prototype.getApproveDevices = function(params, S_CB, F_CB){
    try {
      var deviceDataModel = HIDObjectServices.getRepository("Devices");
      const callback = (status, response) => {
        if (status){
          if(response.Devices.length > 0)
          {
            var devices = this.fetchFriendlyName(response.Devices);            
            S_CB(devices);           
          } else {
            F_CB({"errorMsg" : "User has no device"});            
          }
        } else {
          F_CB(response);}
      };
      deviceDataModel.customVerb("searchDevices", params, callback);
    } catch (exception) {
    }        
  };  
  
  txnSigningBusinessController.prototype.fetchFriendlyName = function(devices){
    let filteredResources = devices.filter(v => (v.type === "DT_TDSV4" || v.type === deviceType) && v.active);
    let friendlyNames = [];
    let tempJson = {};
    filteredResources.forEach(v => {
      tempJson = {"deviceId":v.deviceId,"friendlyName":v.friendlyName};
      friendlyNames.push(tempJson); });
    return friendlyNames;
  };
  txnSigningBusinessController.prototype.getServiceURL = function(S_CB, F_CB){
    let objService = HIDObjectServices.getRepository("GetHostAndTenant");
    const callback = (status,response) => {
      if(response){
        S_CB(response.GetHostAndTenant[0]);
      }
      else {
        F_CB(response);
      }
    };
    objService.customVerb("getServiceURL","", callback);
  };

  txnSigningBusinessController.prototype.getClientAppProperties = function()
   {
    let configurationSvc = kony.sdk.getCurrentInstance().getConfigurationService();
    configurationSvc.getAllClientAppProperties(function(response) {
    clientProperties = response;
    deviceType = (clientProperties.DEVICE_TYPE && clientProperties.DEVICE_TYPE !== null) ? clientProperties.DEVICE_TYPE : deviceType;
      }, function(){});
   };

  txnSigningBusinessController.getInstance = function() {
    instance = instance === null ? new txnSigningBusinessController() : instance;
    return instance;
  };
  return txnSigningBusinessController.getInstance();
});