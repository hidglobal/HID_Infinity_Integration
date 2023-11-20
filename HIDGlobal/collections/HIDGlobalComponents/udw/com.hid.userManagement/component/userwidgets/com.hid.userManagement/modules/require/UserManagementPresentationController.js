define([`com/hid/userManagement/UserManagementBusinessController`], function(UserManagementBusinessController)  {
  var instance = null;
  var pollCounter = 2;
  
  UserManagementPresentationController.prototype.getDevicesForUser = function(username, S_CB, F_CB){
    let params = {"username" : username};
    UserManagementBusinessController.getDevicesForUser(params, S_CB, F_CB);
  };

  UserManagementPresentationController.prototype.updateDeviceStatus = function(deviceId, status, S_CB, F_CB){
    let params = {"DeviceId" : deviceId, "status" : status };
    UserManagementBusinessController.updateDeviceStatus(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.deleteDevice = function(deviceId, S_CB, F_CB){
    let params = {"deviceId" : deviceId};
    UserManagementBusinessController.deleteDevice(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.unassignDevice = function(deviceId,status,owner, S_CB, F_CB){
    let params = {"deviceId" : deviceId , "status" : status , "owner" : owner};
    UserManagementBusinessController.assignUnassignDevice(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.assignDevice = function(deviceId, S_CB, F_CB){
    let params = {"deviceId" : deviceId , "status" : status , "owner" : owner};
    UserManagementBusinessController.assignUnassignDevice(params, S_CB, F_CB);
  };


  UserManagementPresentationController.prototype.updateFriendlyName = function(deviceId, newName, S_CB, F_CB){
    let params = {"deviceId" : deviceId, "friendlyName" : newName};
    UserManagementBusinessController.updateDeviceFriendlyName(params, S_CB, F_CB);
  };

  UserManagementPresentationController.prototype.changeUserPassword = function(username, oldPassword, newPassword, S_CB, F_CB){
    UserManagementBusinessController.changeUserPassword(username, oldPassword, newPassword, S_CB, F_CB);
  };

  UserManagementPresentationController.prototype.registerApproveDevice = function(username, S_CB, F_CB){
    let randNo = Math.floor(Math.random() * 10000);
    let params = {"username": username,"usernameWithRandomNo": `${username}.${randNo}`};
    UserManagementBusinessController.registerApproveDevice(params, success => {
      let provisionMsg = success.RegisterDevice[0].provisionMsg;
      let parsedProvisionMsg = JSON.parse(provisionMsg);
      let response = {
        "provisioningMsg" : success.RegisterDevice[0].provisionMsg,
        "inviteCode" : atob(parsedProvisionMsg.pss),
        "url" : parsedProvisionMsg.url,
        "username" : parsedProvisionMsg.uid,
        "deviceId" : success.RegisterDevice[0].DeviceId
      };
      S_CB(response);
    }, F_CB);
  };

  UserManagementPresentationController.prototype.initiateDeviceRegistrationPolling = function(deviceId, S_CB, F_CB){
    pollCounter--;

    let Success_CB = success => {
      pollCounter = 2;
      S_CB(success);     
    };
    let Failure_CB = error => {
      kony.print("initiateDeviceRegistrationPolling: error: "+JSON.stringify(error));
      if(pollCounter <= 0){        
        pollCounter = 2;
        F_CB(error);       
        
      } else{
        this.initiateDeviceRegistrationPolling(deviceId, S_CB, F_CB);
      }
    };

    let params = {
      "deviceId":deviceId
    };
    UserManagementBusinessController.deviceRegistrationPolling(params, Success_CB,Failure_CB);  
  };
  
  UserManagementPresentationController.prototype.getPasswordPolicy = function(S_CB, F_CB){
    UserManagementBusinessController.getPasswordPolicy(S_CB, F_CB);
  };

  function UserManagementPresentationController(){
  }

  UserManagementPresentationController.getInstance = function(){
    instance = instance === null ? new UserManagementPresentationController() : instance;
    return instance;
  };
  return UserManagementPresentationController.getInstance();
});