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
  NativeControllerIOS.prototype.getLoginFlow = function(){
    kony.print("ApproveSDK ---> inside GetLoginFlow");
    return this.approveSDKWrapper.getLoginFlowCallBack("",this.componentInstance.getRenewableCallbackSuccess);
  };
  NativeControllerIOS.prototype.createContainer = function(qrPayload){
    kony.print("ApproveSDK ---> inside createContainer");
    if(!this.componentInstance.passwordPromptCallback){
       kony.print("ApproveSDK ---> callback is nil");
    }else{
      kony.print("ApproveSDK ---> callback is fine");
    }
    this.approveSDKWrapper.createContainerWithPushIdWithPwdCallBackWithExCallback(qrPayload, "", this.componentInstance.passwordPromptCallback, this.componentInstance.exceptionCallback);
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

  
  return NativeControllerIOS;

});