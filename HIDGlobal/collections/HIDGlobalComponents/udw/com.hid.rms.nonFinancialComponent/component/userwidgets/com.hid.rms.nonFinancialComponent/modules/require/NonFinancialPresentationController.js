define(['com/hid/rms/nonFinancialComponent/NonFinancialBusinessController'], function(NonFinancialBusinessController)  {

  var instance = null;

  NonFinancialPresentationController.prototype.validatePassword = function(username, password, S_CB, F_CB,rmsLoad){
    let transactionId = Math.floor(Math.random() * 10000);    
    let loginJson = {"userid" : username, "password" : password, "requiredRiskScore" : "0", 
                    "currentRiskScore" : "2", "transactionId" : transactionId};
    NonFinancialBusinessController.validatePassword(loginJson, S_CB, F_CB,rmsLoad);
  };
  
  NonFinancialPresentationController.prototype.validate2ndFactorStepDown = function(authType , mfa_key, S_CB , F_CB){
	NonFinancialBusinessController.validate2ndFactorStepDown(authType, mfa_key, S_CB , F_CB);
  };
  
  NonFinancialPresentationController.prototype.sendOTP = function(factor, username, S_CB, F_CB){
    let authType = factor === "OTP_SMS" ? "AT_OOBSMS":"AT_OOBEML";
    let params = {"username" : username,
                 "AuthenticationType" : authType};
    NonFinancialBusinessController.sendOTP(params, S_CB, F_CB);    
  };
  
  NonFinancialPresentationController.prototype.validateOTP = function(username, factor, otp, mfa_key, S_CB, F_CB){
    if(factor === "APPROVE"){
      factor = "SECURE_CODE";
    }
    NonFinancialBusinessController.authenticateSecondFactor(username,factor,otp, mfa_key, S_CB, F_CB);//this.callback.onSuccess.bind(this), 
                                                              //this.callback.onFailure.bind(this));    
  };
  
  NonFinancialPresentationController.prototype.initiateApprove = function(username, deviceId, S_CB, F_CB){    
    let pushMsg = "Please validate the action on the Infinity App.";
        //"Please validate the action to Infinity Demo App";
    let params = {"username" : username, "deviceId" : deviceId, "pushMessage" : pushMsg};
    NonFinancialBusinessController.initiateApproveNotification(params, S_CB, F_CB);
  };
  
  NonFinancialPresentationController.prototype.logout = function(S_CB, F_CB){
    NonFinancialBusinessController.logout(S_CB, F_CB);
  };
  
  NonFinancialPresentationController.prototype.pollForApprove = function(username,success, mfa_key, S_CB, F_CB){
    NonFinancialBusinessController.authenticateSecondFactor(username,"APPROVE", success.auth_req_id, mfa_key, S_CB, F_CB);                                                             
  };
  
  NonFinancialPresentationController.prototype.cancelApprovePolling = function(){
    NonFinancialBusinessController.cancelApprovePolling();
  };
  
  NonFinancialPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
    let params = {"username" : username};
    NonFinancialBusinessController.getApproveDevices(params, S_CB, F_CB);
  };
  
  NonFinancialPresentationController.prototype.rmsActionCreate = function(username,actionType,S_CB,F_CB,rmsLoad){
    this.app_session_id = rmsLoad.app_session_id;
    this.rmsLoad = rmsLoad;
    var userParams = {
        "app_user_id" : username,
        "action_type" : actionType
    };
    var SCB_presentation = response => {
      this.app_action_id = response.app_action_id;
      S_CB.call(this,response);
    };
    var params =Object.assign(userParams, rmsLoad);
    NonFinancialBusinessController.rmsActionCreate(params, SCB_presentation, F_CB);
  };
  
  NonFinancialPresentationController.prototype.rmsActionSign = function(username,authType,S_CB,F_CB){
    var tm_action_id = this.app_action_id;
    var security_item_type = "";
    switch(authType){
      case "APPROVE":
        security_item_type = "pki";
        break;
      case "OTP_SMS":
        security_item_type = "otp";
        break;
       case "STD_PWD":
        security_item_type = "password";
        break;
      default:
        security_item_type = "otp";
    }
    var userParams = {
        "app_user_id" : username,
        "tm_action_id" : tm_action_id,
        "security_item_type" : security_item_type
    };
    var params =Object.assign(userParams, this.rmsLoad);
    NonFinancialBusinessController.rmsActionSign(params, S_CB, F_CB);
  };
  
  NonFinancialPresentationController.prototype.rmsActionComplete = function(status,S_CB,F_CB){
    let tm_action_id = this.app_action_id;
    let params = { 
      "tm_action_id":tm_action_id 
    };
    NonFinancialBusinessController.rmsActionComplete(status,params, S_CB, F_CB);
  };

  /*
  change password flow with MFA: static password as First factor
  */
  NonFinancialPresentationController.prototype.validatePasswordforChangePwd = function(params,S_CB,F_CB){
    NonFinancialBusinessController.validatePasswordforChangePwd(params, S_CB, F_CB);
  };
  /*
  change password flow with 2nf factor MFA: OTP_SMS
  */
  NonFinancialPresentationController.prototype.validateOTPforChangePwd = function(params,S_CB,F_CB){
    NonFinancialBusinessController.validateOTPforChangePwd(params, S_CB, F_CB);
  };

  function NonFinancialPresentationController(){

  }

  NonFinancialPresentationController.getInstance = function(){
    instance = instance === null ? new NonFinancialPresentationController() : instance;
    return instance;
  };
  return NonFinancialPresentationController.getInstance();
});