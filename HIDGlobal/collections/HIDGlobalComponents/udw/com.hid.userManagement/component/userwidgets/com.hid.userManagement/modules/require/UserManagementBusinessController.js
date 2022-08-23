define(function () {
  var instance = null;

  const objectServiceName = {
    "name" : "HIDUserManagement",
    "accessType" : {"access" : "online"}
  };

  const ObjectServices = {
    getDataModel : function (objectName){
      var objectInstance = kony.sdk.getCurrentInstance().getObjectService(objectServiceName.name,objectServiceName.accessType );
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

  UserManagementBusinessController.prototype.validatePassword = function(loginJson, S_CB, F_CB){  
    var client = KNYMobileFabric;
    var serviceName = "customHIDLoginWithoutMFA";
    var identitySvc = client.getIdentityService(serviceName);
    let loginPayload = SCAEventConstants.getLoginPayload(loginJson);
    var options = {
      "payload": loginPayload, 
      "authType" : "STATIC_PWD",
      "isMfa":false
    };
    identitySvc.login(options,success=>S_CB(success),error=> F_CB(error));
  };

  UserManagementBusinessController.prototype.navigateToRegisterDevice = function(username, S_CB, F_CB){ 
    var objSvc = kony.sdk.getCurrentInstance().getObjectService("HIDSelfService", {"access": "online"});
    var dataObject = new kony.sdk.dto.DataObject("getInviteCode");
    let tempNo = Math.floor(Math.random() * 10000); 
    var randNo= username+".".concat(tempNo);
    dataObject.addField("username", username);
    dataObject.addField("filter", username);
    dataObject.addField("UserId","39845");
    dataObject.addField("usernameWithRandomNo",randNo);
    var options = {"dataObject": dataObject};
    objSvc.customVerb("getInviteCode", options, success => S_CB(success),error => F_CB(error));
  };

  UserManagementBusinessController.prototype.getDevicesForUser = function(params, S_CB, F_CB){
    try{
      var searchDeviceModel = ObjectServices.getDataModel("SearchDevices");
      const callback = (status, response) => {
        if(status){
          if(response.SearchDevices.length>0){
            response.SearchDevices = response.SearchDevices.filter(v => v.status != "PENDING" && v.type != "DT_TDSOOB");
          }
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      searchDeviceModel.customVerb("SearchDevices", params, callback);

    } catch(exception){
      alert("Exception occurred in GetDevicesForUser, error : "+ exception.message);
    }
  };

  UserManagementBusinessController.prototype.updateDeviceStatus = function(params, S_CB, F_CB){
    try{
      var updateDeviceModel = ObjectServices.getDataModel("UpdateDeviceStatus");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      updateDeviceModel.customVerb("updateDeviceStatus", params, callback);

    } catch(exception){
      alert("Exception occurred in updateDeviceStatus, error : "+ exception.message);
    }
  };

  UserManagementBusinessController.prototype.changeUserPassword = function(username,oldPassword, newPassword, S_CB, F_CB){
    const success = (result) =>
    {
      try{
        var changePwdModel = ObjectServices.getDataModel("ChangePassword");
        let params = {"userName" : username, "password" : newPassword};
        const callback = (status, response) => {
          if(status){
            S_CB(response);
          } else {
            F_CB(response);
          }
        };
        changePwdModel.customVerb("ChangePwd", params, callback);

      } catch(exception){
        alert("Exception occurred in changeUserPassword, error : "+ exception.message);
      }};

//    this.validatePassword(username, oldPassword, success, F_CB);
    let transactionId = Math.floor(Math.random() * 10000);
    let loginJson = {"userid" : username, "password" : oldPassword, "requiredRiskScore" : "0", 
                    "currentRiskScore" : "2", "transactionId" : transactionId};
    this.validatePassword(loginJson, success, F_CB);
    
  };

  UserManagementBusinessController.prototype.updateDeviceFriendlyName = function(params, S_CB, F_CB){
    try{
      var updateDeviceNameModel = ObjectServices.getDataModel("UpdateDeviceName");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      updateDeviceNameModel.customVerb("updateFriendlyName", params, callback);

    } catch(exception){
      alert("Exception occurred in updateDeviceFriendlyName, error : "+ exception.message);
    }
  };

  UserManagementBusinessController.prototype.registerApproveDevice = function(params, S_CB, F_CB){
    try{
      var registerDeviceModel = ObjectServices.getDataModel("RegisterDevice");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      registerDeviceModel.customVerb("getProvisioningMsg", params, callback);
    } catch(exception){
      alert("Exception occurred in registerApproveDevice, error : "+ exception.message);
    }
  };

  UserManagementBusinessController.prototype.deviceRegistrationPolling = function(params, S_CB, F_CB) {
    let devRegPollingModel = ObjectServices.getDataModel("DeviceRegistrationPolling");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };
    devRegPollingModel.customVerb("deviceRegistrationPolling", params, callback);
  };

  UserManagementBusinessController.prototype.getPasswordPolicy = function(S_CB, F_CB){
    let passwordPolicyModel = ObjectServices.getDataModel("PasswordPolicy");
    const callback = (status, response) => {
      if (status) {
        S_CB(response);
      } else {
        F_CB(response);
      }
    };    
    passwordPolicyModel.customVerb("getPolicy", {}, callback);
  };


  function UserManagementBusinessController() {

  }

  UserManagementBusinessController.getInstance = function() {
    instance = instance === null ? new UserManagementBusinessController() : instance;
    return instance;
  };


  return UserManagementBusinessController.getInstance();
});