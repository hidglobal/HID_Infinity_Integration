define(['com/hid/rms/payments/KonyLogger'],function (KonyLogger) {

  var konymp = konymp || {};
  konymp.logger = (new KonyLogger("HID RMS Payments Component")) || function () {};
  var globals ={};
  var instance = null;
  const objectServiceName = {
    "name" : "HIDRMSPayments",
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

  PaymentsBusinessController.prototype.paymentCreate = function(params, S_CB, F_CB) {
    let rmsObjService = ObjectServices.getDataModel("PaymentCreate");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.PaymentCreate[0]);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("paymentCreate", params, callback);
  };

  PaymentsBusinessController.prototype.paymentSign = function(params, S_CB, F_CB) {
    let rmsObjService = ObjectServices.getDataModel("PaymentSign");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.PaymentSign[0]);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("paymentSign", params, callback);
  };

  PaymentsBusinessController.prototype.paymentUpdate = function(params, S_CB, F_CB) {
    let rmsObjService = ObjectServices.getDataModel("PaymentUpdate");
    const callback = (status, response) => {
      if (status) {
        S_CB(response.PaymentUpdate[0]);
      } else {
        F_CB(response);
      }
    };
    rmsObjService.customVerb("paymentUpdate", params, callback);
  };

  function PaymentsBusinessController() {
  }

  PaymentsBusinessController.getInstance = function() {
    instance = instance === null ? new PaymentsBusinessController() : instance;
    return instance;
  };
  return PaymentsBusinessController.getInstance();
});