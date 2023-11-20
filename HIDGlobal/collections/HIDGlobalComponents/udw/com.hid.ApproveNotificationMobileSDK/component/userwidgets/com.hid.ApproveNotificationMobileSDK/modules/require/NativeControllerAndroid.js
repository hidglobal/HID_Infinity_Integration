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
     NativeControllerAndroid.prototype.setNotificationStatus =function(txID,status,password){
       kony.print("ApproveSDK ---> Android Controller " + txID);
       this.sdkWrapperObj.setNotificationStatus(txID,status,password,this.componentInstance.onCompletionCallback, this.componentInstance.pwdPromtCallback,this.konyContext,this.konyActivity);
    };
    NativeControllerAndroid.prototype.retriveTransaction =function(txID,password,isBioEnabled){
       return this.sdkWrapperObj.retriveTransaction(txID,this.konyContext,this.konyActivity,password,isBioEnabled,this.componentInstance.retriveTransactionCallback);
    };
    NativeControllerAndroid.prototype.notifyPassword =function(password,mode){
       this.sdkWrapperObj.notifyPassword(password,mode);
    };
    NativeControllerAndroid.prototype.checkForBioAvailability = function(){
      return this.sdkWrapperObj.checkForBioAvailability(this.konyContext);
    };
    NativeControllerAndroid.prototype.authenticatiationForPush = function(password,isBioEnabled){
      return this.sdkWrapperObj.authenticatiationForPush(password,isBioEnabled,this.componentInstance.authenticatiationForPushCallback);
    };
    NativeControllerAndroid.prototype.retrievePendingNotifications = function(){
        return this.sdkWrapperObj.retrievePendingNotifications(this.konyContext, this.componentInstance.onRecievedNotificationsCallback);
    };
    NativeControllerAndroid.prototype.updateUsername =function(username){
      this.sdkWrapperObj.setUsername(username);
    };
    NativeControllerAndroid.prototype.getPasswordPolicy =function(){
      return this.sdkWrapperObj.getPasswordPolicy(this.konyContext);
    };
    NativeControllerAndroid.prototype.updatePassword =function(oldPassword,newPassword){
      this.sdkWrapperObj.updatePassword(oldPassword,newPassword,this.konyContext,this.componentInstance.updatePwdCallbackInternalComponent,true);
    };

    return NativeControllerAndroid;
});