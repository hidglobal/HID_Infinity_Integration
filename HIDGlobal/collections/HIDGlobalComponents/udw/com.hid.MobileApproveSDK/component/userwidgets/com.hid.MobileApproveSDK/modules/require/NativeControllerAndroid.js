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
    NativeControllerAndroid.prototype.updateUsername =function(username){
      this.sdkWrapperObj.setUsername(username);
    };
    NativeControllerAndroid.prototype.setPasswordToUser =function(password){
      this.sdkWrapperObj.setPasswordForUser(password);
    };
    NativeControllerAndroid.prototype.getPasswordPolicy =function(){
      return this.sdkWrapperObj.getPasswordPolicy(this.konyContext);
    };
    NativeControllerAndroid.prototype.updatePassword =function(oldPassword,newPassword){
      this.sdkWrapperObj.updatePassword(oldPassword,newPassword,this.konyContext,this.componentInstance.updatePwdCallbackInternalComponent,true);
    };
    NativeControllerAndroid.prototype.updatePasswordExplicit =function(oldPassword,newPassword){
      this.sdkWrapperObj.updatePassword(oldPassword,newPassword,this.konyContext,this.componentInstance.updatePwdCallbackInternal,true);
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
      this.sdkWrapperObj.setBiometricPrompt(this.konyActivity,msg);
    };
    NativeControllerAndroid.prototype.checkForBioAvailability = function(){
      return this.sdkWrapperObj.checkForBioAvailability(this.konyContext);
    };
    NativeControllerAndroid.prototype.generateOTP = function(pwd,isBiometricEnabled,label = "hotp"){
      return this.sdkWrapperObj.generateOTP(this.konyActivity,pwd,isBiometricEnabled,this.componentInstance.generateOTPSuccess,this.componentInstance.generateOTPFailure,label);
    };
    NativeControllerAndroid.prototype.generateOTPExplicit = function(pwd,isBiometricEnabled, label = "hotp"){
      return this.sdkWrapperObj.generateOTP(this.konyActivity,pwd,isBiometricEnabled,this.componentInstance.secureCodeSuccess,this.componentInstance.secureCodeFailure,label);
    };
    NativeControllerAndroid.prototype.renewContainer = function(password){
      this.sdkWrapperObj.renewContainer(password,this.konyContext,this.konyActivity,this.componentInstance.renewContainerCallback,this.componentInstance.renewContainerExceptionCB);
    };
    NativeControllerAndroid.prototype.deleteUserProfile = function(){
      return this.sdkWrapperObj.deleteContainer(this.konyContext);
    };
    NativeControllerAndroid.prototype.deleteContainerWithAuth = function(password){
      this.sdkWrapperObj.deleteContainerWithAuth(this.konyContext,this.konyActivity,password,this.componentInstance.deleteContainerCallback);   
    };
    NativeControllerAndroid.prototype.verifyPassword = function(password, isBiometricEnabled,bioString){
      this.sdkWrapperObj.verifyPassword(this.konyContext,this.konyActivity,password,isBiometricEnabled,bioString,this.componentInstance.verifyPasswordCallbackInternal);   
    };
    NativeControllerAndroid.prototype.getContainerRenewableDate = function(){
      return this.sdkWrapperObj.getContainerRenewableDate();
    };
  NativeControllerAndroid.prototype.setNotificationStatus = function(txtId, status, pin){
      return this.sdkWrapperObj.setNotificationStatus(txtId,status,pin,this.componentInstance.scanToApproveCompletionCallback, this.componentInstance.pwdPromptCallback, this.konyContext, this.konyActivity);   
    };
    return NativeControllerAndroid;
});