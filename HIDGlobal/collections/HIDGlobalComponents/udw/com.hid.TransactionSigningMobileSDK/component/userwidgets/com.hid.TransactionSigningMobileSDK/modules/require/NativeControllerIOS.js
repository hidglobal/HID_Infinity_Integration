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
  NativeControllerIOS.prototype.signTransaction =function(values){
       this.approveSDKWrapper.signTransactionWithPwdPromptCallbackWithSuccessCBWithFailureCB(values, this.componentInstance.pwdPromtCallback, this.componentInstance.SCB_signTransaction, this.componentInstance.FCB_signTransaction);
   };
   NativeControllerIOS.prototype.notifyPassword =function(password,mode){
       this.approveSDKWrapper.notifyPasswordWithMode(password, mode);
   };
   NativeControllerIOS.prototype.getPasswordPolicy = function(){
      return this.approveSDKWrapper.getPasswordPolicy();
  };
  NativeControllerIOS.prototype.updatePassword = function(oldPassword,newPassword){
     this.approveSDKWrapper.updatePasswordNewPasswordExceptionCallbackIsPasswordPolicy(oldPassword,newPassword,this.componentInstance.exceptionCallback,true);
};
  return NativeControllerIOS;
});