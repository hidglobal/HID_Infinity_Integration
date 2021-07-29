define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
    var NativeControllerAndroid = function(componentInstance) {
          this.componentInstance = componentInstance;
          this.KonyMain = java.import("com.konylabs.android.KonyMain");
          this.konyContext = this.KonyMain.getActivityContext();   
          this.konyActivity = this.KonyMain.getActContext();
          this.sdkWrapperObj = java.newInstance("com.hid.ApproveSDKWrapper");
          NativeController(componentInstance);
    };
    Inherits(NativeControllerAndroid, NativeController);
    
    NativeControllerAndroid.prototype.createContainer = function(qrPayload){
      this.sdkWrapperObj.createContainer(qrPayload,this.konyContext,sdkNotificationManager.getPushId(),this.componentInstance.passwordPromptCallback ,this.componentInstance.exceptionCallback);
    };
    NativeControllerAndroid.prototype.setPasswordToUser =function(password){
      this.sdkWrapperObj.setPasswordForUser(password);
    };
    NativeControllerAndroid.prototype.getPasswordPolicy =function(){
      return this.sdkWrapperObj.getPasswordPolicy(this.konyContext);
    };
    NativeControllerAndroid.prototype.updatePassword =function(oldPassword,newPassword){
      this.sdkWrapperObj.updatePassword(oldPassword,newPassword,this.konyContext,this.componentInstance.exceptionCallback,true);
    };
  
 NativeControllerAndroid.prototype.getLoginFlow =function(pushID){
      kony.print("PushId is ---> " + pushID);
      return this.sdkWrapperObj.getLoginFlow(this.konyContext,pushID,this.componentInstance.getRenewableCallbackSuccess);
    };

    NativeControllerAndroid.prototype.enableBioMetrics = function(password){
      this.sdkWrapperObj.enableBioMetrics(password,this.componentInstance.bioStatusCallback);
    };
    NativeControllerAndroid.prototype.disableBioMetrics = function(){
      this.sdkWrapperObj.disableBioMetrics();
    };
    NativeControllerAndroid.prototype.setBiometricPrompt = function(msg){
      this.sdkWrapperObj.setBiometricPrompt(this.konyContext,msg);
    };
    NativeControllerAndroid.prototype.checkForBioAvailability = function(){
      return this.sdkWrapperObj.checkForBioAvailability(this.konyContext);
    };
    NativeControllerAndroid.prototype.generateOTP = function(pwd,isBiometricEnabled){
      return this.sdkWrapperObj.generateOTP(pwd,isBiometricEnabled,this.componentInstance.generateOTPSuccess,this.componentInstance.generateOTPFailure);
    };
    NativeControllerAndroid.prototype.renewContainer = function(password){
      this.sdkWrapperObj.renewContainer(password,this.konyContext,this.componentInstance.renewContainercallback,this.componentInstance.renewContainerExceptionCB);
    };
    return NativeControllerAndroid;
});