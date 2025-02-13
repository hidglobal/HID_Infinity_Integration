define([`com/hid/userManagement/UserManagementBusinessController`], function(UserManagementBusinessController)  {
  var instance = null;
  var pollCounter = 2;
  
  UserManagementPresentationController.prototype.getDevicesForUser = function(username, S_CB, F_CB){
    let params = {"username" : username};
    UserManagementBusinessController.getDevicesForUser(params, S_CB, F_CB);
  };

  UserManagementPresentationController.prototype.updateDeviceStatus = function(deviceId, status, S_CB, F_CB,correlationId){
    let params = {"DeviceId" : deviceId, "status" : status , "correlationId": correlationId };
    UserManagementBusinessController.updateDeviceStatus(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.deleteDevice = function(deviceId, S_CB, F_CB,correlationId){
    let params = {"deviceId" : deviceId, "correlationId": correlationId};
    UserManagementBusinessController.deleteDevice(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.unassignDevice = function(deviceId,status,owner, S_CB, F_CB,correlationId){
    let params = {"deviceId" : deviceId , "status" : status , "owner" : owner , "correlationId": correlationId};
    UserManagementBusinessController.assignUnassignDevice(params, S_CB, F_CB);
  };
  
  UserManagementPresentationController.prototype.assignDevice = function(deviceId,status,owner, S_CB, F_CB, correlationId){
    let params = {"deviceId" : deviceId , "status" : status , "owner" : owner , "correlationId": correlationId};
    UserManagementBusinessController.assignUnassignDevice(params, S_CB, F_CB);
  };


  UserManagementPresentationController.prototype.updateFriendlyName = function(deviceId, newName, S_CB, F_CB,correlationId){
    let params = {"deviceId" : deviceId, "friendlyName" : newName , "correlationId": correlationId};
    UserManagementBusinessController.updateDeviceFriendlyName(params, S_CB, F_CB);
  };

  UserManagementPresentationController.prototype.changeUserPassword = function(username, oldPassword, newPassword, S_CB, F_CB,correlationId){
    UserManagementBusinessController.changeUserPassword(username, oldPassword, newPassword, S_CB, F_CB,correlationId);
  };

  UserManagementPresentationController.prototype.registerApproveDevice = function(username, S_CB, F_CB,correlationId){
    let randNo = Math.floor(Math.random() * 10000);
    let params = {"username": username,"usernameWithRandomNo": `${username}.${randNo}`, "correlationId": correlationId};
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
  
  function arrayBufferToBase64url(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary)
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  
  UserManagementPresentationController.prototype.registerFIDODevice = function(username, S_CB, F_CB,correlationId)
  {
    let params = { "username": username , "correlationId": correlationId };
    
    let s_cb = success => {
      const request_uri = success.FIDORegistration[0].request_uri;
      const csrf = success.FIDORegistration[0]["server-csrf-token"];
      let publicKey = success.FIDORegistration[0].publicKeyCredentialOptions[0];
      
      publicKey = {
        challenge: Uint8Array.from(window.atob(publicKey.challenge.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0)),
        rp: {
          id: publicKey.rp[0].id,
          name: "localhost"
        },
        user: {
          id: Uint8Array.from(window.atob(publicKey.user[0].id.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0)),
          name: publicKey.user[0].name,
          displayName: publicKey.user[0].displayName
        },
        authenticatorSelection: publicKey.authenticatorSelection[0],
        pubKeyCredParams: publicKey.pubKeyCredParams
      };
      
      for (p in publicKey.pubKeyCredParams) {
        publicKey.pubKeyCredParams[p].alg = parseInt(publicKey.pubKeyCredParams[p].alg);
      }
      
      navigator.credentials.create({publicKey})
      .then(pubKeyCred => {
        
      	let credential = {
          type: pubKeyCred.type,
          id: pubKeyCred.id ? pubKeyCred.id : null,
          rawId: arrayBufferToBase64url(pubKeyCred.rawId),
          response: {
            clientDataJSON: arrayBufferToBase64url(pubKeyCred.response.clientDataJSON),
            attestationObject: arrayBufferToBase64url(pubKeyCred.response.attestationObject)
          }
        };
        
        let successCallback = success => {
          
        };
        
        let failureCallback = err => {
          
        };
        
        const inpParams = {
          "csrf": csrf,
          "username": username,
          "request_uri": request_uri,
          "id": credential.id,
          "rawId": credential.rawId,
          "clientDataJSON": credential.response.clientDataJSON,
          "attestationObject": credential.response.attestationObject,
          "correlationId": correlationId
        };
        
        UserManagementBusinessController.registerFIDODevice(inpParams, S_CB, F_CB);
      })
      .catch(err => {
      	F_CB(err);
      });
    };
    
    UserManagementBusinessController.getFIDORegistrationOptions(
      params, s_cb, F_CB);
  }

  function UserManagementPresentationController(){
  }

  UserManagementPresentationController.getInstance = function(){
    instance = instance === null ? new UserManagementPresentationController() : instance;
    return instance;
  };
  return UserManagementPresentationController.getInstance();
});