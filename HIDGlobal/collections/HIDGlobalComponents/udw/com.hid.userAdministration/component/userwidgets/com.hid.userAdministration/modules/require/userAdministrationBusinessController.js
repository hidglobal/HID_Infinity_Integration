define(function () {
  var instance = null;
 
  const objectServiceName = {
    "name" : "HIDUserAdministration",
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
  
  userAdministrationBusinessController.prototype.validatePassword = function(username, password, S_CB, F_CB){
    var client = KNYMobileFabric;
    var serviceName = "OrgAdminScim";
    var identitySvc = client.getIdentityService(serviceName);
    var options = {
      "userid": username,
      "password": password
    };
    identitySvc.login(options,success=>S_CB(success),error=> F_CB(error));
  };
  
   userAdministrationBusinessController.prototype.resetFailureCount = function(params, S_CB, F_CB){
    try{
      var getAuthsModel = ObjectServices.getDataModel("ResetAuthFailCount");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      getAuthsModel.customVerb("resetFailCount", params, callback);
       

    } catch(exception){
      alert("Exception occurred in resetPassword, error : "+ exception.message);
    }
  };
  
  userAdministrationBusinessController.prototype.viewAuthenticators = function(params, S_CB, F_CB){
    try{
      var getAuthsModel = ObjectServices.getDataModel("Authenticators");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      getAuthsModel.customVerb("listAuthenticators", params, callback);

    } catch(exception){
      alert("Exception occurred in viewAuthenticators, error : "+ exception.message);
    }
  };
 
  userAdministrationBusinessController.prototype.enableDisableAuthenticator = function(params, S_CB, F_CB){
    try{
      var enableDisableModel = ObjectServices.getDataModel("ChangeAuthenticatorStatus");
      const callback = (status, response) => {
        if(status){
          S_CB(response);
        } else {
          F_CB(response);
        }
      };
      enableDisableModel.customVerb("changeAuthStatus", params, callback);

    } catch(exception){
      alert("Exception occurred in changeAuthenticatorStatus, error : "+ exception.message);
    }
  };

  function userAdministrationBusinessController() {

  }

   userAdministrationBusinessController.getInstance = function() {
    instance = instance === null ? new userAdministrationBusinessController() : instance;
    return instance;
  };


  return userAdministrationBusinessController.getInstance();
});