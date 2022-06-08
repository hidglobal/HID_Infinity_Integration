define(['./Inherits', './NativeController'], function(Inherits, NativeController) {

  var NativeControllerIOS = function(componentInstance) {
    // Constructor
    var wrapperClass = objc.import("HIDApproveSDKWrapper");
    this.approveSDKWrapper = wrapperClass.alloc().jsinit(); 
    if(this.approveSDKWrapper){
      kony.print("ApproveSDK ---> Framework Loaded ");
    }else{
      kony.print("ApproveSDK ---> Framework NOT Loaded ");
    }
    this.componentInstance = componentInstance;
  };
  Inherits(NativeControllerIOS, NativeController);
  /**
     * @function scan
     * @private
     * @description: scan the code
     */
  NativeControllerIOS.prototype.getLoginFlow = function(pushId){
    kony.print("ApproveSDK ---> inside GetLoginFlow");
    return this.approveSDKWrapper.getLoginFlowCallBack(pushId,this.componentInstance.getRenewableCallbackSuccess);
  };
  NativeControllerIOS.prototype.createContainer = function(qrPayload){
    kony.print("ApproveSDK ---> inside createContainer");
    if(!this.componentInstance.passwordPromptCallback){
       kony.print("ApproveSDK ---> callback is nil");
    }else{
      kony.print("ApproveSDK ---> callback is fine");
    }
    this.approveSDKWrapper.createContainerWithPushIdWithPwdCallBackWithExCallback(qrPayload, sdkNotificationManager.getPushId(), this.componentInstance.passwordPromptCallback, this.componentInstance.exceptionCallback);
  };
  NativeControllerIOS.prototype.enableBioMetrics = function(password){
     kony.print("ApproveSDK ---> inside enableBioMetrics");
     this.approveSDKWrapper.enableBiometricsStatusCB(password,this.componentInstance.bioStatusCallback);
  };
  NativeControllerIOS.prototype.disableBioMetrics = function(){
    kony.print("ApproveSDK ---> inside disableBioMetrics");
    this.approveSDKWrapper.disableBiometrics();
  };
  NativeControllerIOS.prototype.setPasswordToUser =function(password){
      this.approveSDKWrapper.setPasswordForUser(password);
  };
  NativeControllerIOS.prototype.updateUsername =function(username){
      this.approveSDKWrapper.setUsername(username);
  };
  NativeControllerIOS.prototype.checkForBioAvailability = function(){
   kony.print("ApproveSDK ---> inside checkForBioAvailability");
   if(this.componentInstance.checkForFingerPrintStatus()){
       return this.approveSDKWrapper.checkBioAvailability();
    }else{
      return false;
    } 
  };
  NativeControllerIOS.prototype.generateOTP = function(pwd,isBiometricEnabled){
    kony.print("ApproveSDK ---> inside generateOTP");
    this.approveSDKWrapper.generateOTPIsBioEnabledWithSuccessCBFailureCB(pwd,isBiometricEnabled,this.componentInstance.generateOTPSuccess,this.componentInstance.generateOTPFailure);
  };
  NativeControllerIOS.prototype.updatePassword = function(oldPassword,newPassword){
    this.approveSDKWrapper.updatePasswordNewPasswordExceptionCallbackIsPasswordPolicy(oldPassword,newPassword,this.componentInstance.exceptionCallback,true);
  };
  NativeControllerIOS.prototype.getPasswordPolicy = function(){
     return this.approveSDKWrapper.getPasswordPolicy();
  };
  NativeControllerIOS.prototype.renewContainer = function(password){
    this.approveSDKWrapper.renewContainerWithPwdCallBackWithExceptionCallBack(password,this.componentInstance.renewContainercallback,this.componentInstance.renewContainerExceptionCB);
  };
  NativeControllerIOS.prototype.deleteUserProfile = function(){
      return this.approveSDKWrapper.deleteContainer();
  };
  NativeControllerIOS.prototype.generateOTPExplicit = function(pwd,isBiometricEnabled){
      return this.approveSDKWrapper.generateOTPIsBioEnabledWithSuccessCBFailureCB(pwd,isBiometricEnabled,this.componentInstance.secureCodeSuccess,this.componentInstance.secureCodeFailure);
  };
  NativeControllerIOS.prototype.deleteContainerWithAuth = function(password){
     this.approveSDKWrapper.deleteContainerWithAuthWithCallback(password, this.componentInstance.deleteContainerCallback);
  }
  return NativeControllerIOS;

});