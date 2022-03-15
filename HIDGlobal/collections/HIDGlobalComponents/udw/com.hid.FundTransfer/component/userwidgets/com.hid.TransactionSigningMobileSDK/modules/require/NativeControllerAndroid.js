define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
    var NativeControllerAndroid = function(componentInstance) {
          this.componentInstance = componentInstance
          this.KonyMain = java.import("com.konylabs.android.KonyMain");
          this.konyContext = this.KonyMain.getActivityContext();   
          this.konyActivity = this.KonyMain.getActContext();
          this.sdkWrapperObj = java.newInstance("com.hid.ApproveSDKWrapper");
          NativeController(componentInstance);
    };
    Inherits(NativeControllerAndroid, NativeController);
    NativeControllerAndroid.prototype.signTransaction =function(values){
       this.sdkWrapperObj.signTransaction(values,this.componentInstance.pwdPromtCallback,this.componentInstance.SCB_signTransaction,this.componentInstance.FCB_signTransaction,this.konyContext);
    };
    NativeControllerAndroid.prototype.notifyPassword =function(password,mode){
       this.sdkWrapperObj.notifyPassword(password,mode);
    };
    NativeControllerAndroid.prototype.getPasswordPolicy =function(){
      return this.sdkWrapperObj.getPasswordPolicy(this.konyContext);
    };
    NativeControllerAndroid.prototype.updatePassword =function(oldPassword,newPassword){
      this.sdkWrapperObj.updatePassword(oldPassword,newPassword,this.konyContext,this.componentInstance.exceptionCallback,true);
    };    
    return NativeControllerAndroid;
});