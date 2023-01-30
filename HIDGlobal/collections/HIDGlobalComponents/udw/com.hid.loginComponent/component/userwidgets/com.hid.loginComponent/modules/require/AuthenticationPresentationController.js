define(['com/hid/loginComponent/AuthenticationBusinessController'], function(AuthenticationBusinessController)  {

  var instance = null;

  AuthenticationPresentationController.prototype.validatePassword = function(username, password, S_CB, F_CB,rmsLoad=null){
    let transactionId = Math.floor(Math.random() * 10000);    
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                     "currentRiskScore" : "2", "transactionId" : transactionId};
    
    AuthenticationBusinessController.validatePassword(loginJson, S_CB, F_CB,rmsLoad);
  };
  
  AuthenticationPresentationController.prototype.authenticateFirstFactor = function(username, password,authType, S_CB, F_CB,rmsLoad=null){
    if(authType === "OTP_SMS_PIN"){
      authType = "OTP_SMS";
    }
    let transactionId = Math.floor(Math.random() * 10000);    
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                     "currentRiskScore" : "2", "transactionId" : transactionId};
    AuthenticationBusinessController.authenticateFirstFactor(loginJson,authType, S_CB, F_CB,rmsLoad);
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
                 "isPasswordRequired": isPasswordRequired};
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

  AuthenticationPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
    let params = {"username" : username};
    AuthenticationBusinessController.getApproveDevices(params, S_CB, F_CB);
  };
  AuthenticationPresentationController.prototype.rmsSessionLogout = function(username,session,S_CB,F_CB){
    let params = {"username" : username, "session":session };
    AuthenticationBusinessController.rmsSessionLogout(params, S_CB, F_CB);
  };

  function AuthenticationPresentationController(){

  }

  AuthenticationPresentationController.getInstance = function(){
    instance = instance === null ? new AuthenticationPresentationController() : instance;
    return instance;
  };
  return AuthenticationPresentationController.getInstance();
});