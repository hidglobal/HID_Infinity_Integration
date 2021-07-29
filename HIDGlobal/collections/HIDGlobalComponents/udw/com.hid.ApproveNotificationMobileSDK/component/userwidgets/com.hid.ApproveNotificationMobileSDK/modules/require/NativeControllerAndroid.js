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
       this.sdkWrapperObj.setNotificationStatus(txID,status,password,this.componentInstance.onCompletionCallback, this.componentInstance.pwdPromtCallback,this.konyContext);
    };
    NativeControllerAndroid.prototype.retriveTransaction =function(txID,password,isBioEnabled){
       this.sdkWrapperObj.retriveTransaction(txID,this.konyContext,password,isBioEnabled,this.componentInstance.retriveTransactionCallback);
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

    return NativeControllerAndroid;
});