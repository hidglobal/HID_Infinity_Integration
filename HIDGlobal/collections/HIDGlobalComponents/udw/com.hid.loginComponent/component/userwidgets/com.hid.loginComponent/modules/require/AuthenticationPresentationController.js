define(['com/hid/loginComponent/AuthenticationBusinessController'], function(AuthenticationBusinessController)  {

  var instance = null;
  var msgId = "";
  AuthenticationPresentationController.prototype.validatePassword = function(username, password, S_CB, F_CB,rmsLoad=null){
    let transactionId = Math.floor(Math.random() * 10000); 
    msgId = transactionId;
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                     "currentRiskScore" : "2", "transactionId" : transactionId};
    
    AuthenticationBusinessController.validatePassword(loginJson, S_CB, F_CB,rmsLoad);
  };
  
   AuthenticationPresentationController.prototype.authenticateFido = function(username, password,request_uri,csrf, S_CB, F_CB,rmsLoad=null){
    let transactionId = Math.floor(Math.random() * 10000); 
    msgId = transactionId;
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0",
                     "currentRiskScore" : "2", "transactionId" : transactionId,
                    "request_uri": request_uri,"csrf":csrf};
    
    AuthenticationBusinessController
      .authenticateFirstFactor(loginJson, "FIDO", S_CB, F_CB, rmsLoad);
  };
  
  AuthenticationPresentationController.prototype.authenticateFirstFactor
    = function(username, password, authType, S_CB, F_CB, rmsLoad=null)
  {
    if(authType === "OTP_SMS_PIN"){
      authType = "OTP_SMS";
    }
    let transactionId = Math.floor(Math.random() * 10000);  
    msgId = transactionId;
    let loginJson = {
      "userid": username, "password": password,
      "requiredRiskScore": "0", "currentRiskScore": "2",
      "transactionId" : transactionId
    };
    
    AuthenticationBusinessController
      .authenticateFirstFactor(loginJson, authType, S_CB, F_CB, rmsLoad);
  };

  AuthenticationPresentationController.prototype.updateRMSServiceEvent = function(authType , mfa_key, S_CB , F_CB,password="12345"){
    AuthenticationBusinessController.updateRMSServiceEvent(authType, mfa_key, S_CB , F_CB, password);
  };

  AuthenticationPresentationController.prototype.sendOTP = function(factor, username, S_CB, F_CB,isPasswordRequired = false, password=""){
    if(factor === "OTP_SMS_PIN"){
      factor = "OTP_SMS";
    }
    let authType = factor === "OTP_SMS" ? "AT_OOBSMS":"AT_OOBEML";
    let params = {"username" : username,
                  "AuthenticationType" : authType,
                 "isPasswordRequired": isPasswordRequired,
                 "msgId": msgId};
    if(isPasswordRequired){
      params.password = password;
    }
    AuthenticationBusinessController.sendOTP(params, S_CB, F_CB);    
  };

  AuthenticationPresentationController.prototype.validateOTP = function(factor ,otp, mfa_key, S_CB, F_CB){
    if(factor === "APPROVE"){
      factor = "SECURE_CODE";
    }
    AuthenticationBusinessController.authenticateSecondFactor(factor,otp, mfa_key, S_CB, F_CB);//this.callback.onSuccess.bind(this), 
    //this.callback.onFailure.bind(this));    
  };

  AuthenticationPresentationController.prototype.initiateApprove = function(username, deviceId, S_CB, F_CB){    
    let pushMsg ="Please validate logon to Infinity Demo App";
    let params = {"username" : username, "deviceId" : deviceId, "pushMessage" : pushMsg};
    AuthenticationBusinessController.initiateApproveNotification(params, S_CB, F_CB);
  };

  AuthenticationPresentationController.prototype.logout = function(S_CB, F_CB){
    AuthenticationBusinessController.logout(S_CB, F_CB);
  };

  AuthenticationPresentationController.prototype.pollForApprove = function(success, mfa_key, S_CB, F_CB){
    AuthenticationBusinessController.authenticateSecondFactor("APPROVE", success.auth_req_id, mfa_key, S_CB, F_CB);                                                             
  };

  AuthenticationPresentationController.prototype.cancelApprovePolling = function(){
    AuthenticationBusinessController.cancelApprovePolling();
  };
  
  AuthenticationPresentationController.prototype.pollForScanToApprove = function(username, password,authType, S_CB, F_CB,rmsLoad=null){
    kony.print("rmsload " + rmsLoad);
    AuthenticationBusinessController.scanToApproveFirstFactor(username,password, authType,S_CB, F_CB,rmsLoad);
    
  }

  AuthenticationPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
    let params = {"username" : username,
                 "msgId": msgId};
    AuthenticationBusinessController.getApproveDevices(params, S_CB, F_CB);
  };
  AuthenticationPresentationController.prototype.rmsSessionLogout = function(username,session,S_CB,F_CB){
    let params = {"username" : username, "session":session };
    AuthenticationBusinessController.rmsSessionLogout(params, S_CB, F_CB);
  };
  
  AuthenticationPresentationController.prototype.getClientIp = function(S_CB,F_CB){
    AuthenticationBusinessController.getClientIp(S_CB, F_CB);
  };
  
  AuthenticationPresentationController.prototype.getClientIpScanToApprove = function(qrDataResponse,S_CB,F_CB){
    AuthenticationBusinessController.getClientIpScanToApprove(qrDataResponse,S_CB, F_CB);
  };
  
  AuthenticationPresentationController.prototype.getScanToApproveQrData = function(S_CB,F_CB){
  
    AuthenticationBusinessController.getScanToApproveQrData(S_CB, F_CB);

    };
    
AuthenticationPresentationController.prototype.getFIDOAuthentication = function(username, S_CB,F_CB){
    const params = {username: username}
    AuthenticationBusinessController.getFIDOAuthenticationOptions(params, S_CB, F_CB);
  };
  
  AuthenticationPresentationController.prototype.authenticateFIDOExplicit = function(username, id, clientDataJSON, authenticatorData, signature, userHandle, request_uri, csrf, S_CB, F_CB){
    let params = {
      "username" : username, 
      "id" : id,
      "clientDataJSON" : clientDataJSON,
      "authenticatorData" : authenticatorData,
      "signature" : signature,
      "userHandle" : userHandle,
      "request_uri" : request_uri,
      "csrf" : csrf
    };
    AuthenticationBusinessController.authenticateFIDO(params, S_CB, F_CB);
  };

  function AuthenticationPresentationController(){

  }

  AuthenticationPresentationController.getInstance = function(){
    instance = instance === null ? new AuthenticationPresentationController() : instance;
    return instance;
  };
  return AuthenticationPresentationController.getInstance();
});