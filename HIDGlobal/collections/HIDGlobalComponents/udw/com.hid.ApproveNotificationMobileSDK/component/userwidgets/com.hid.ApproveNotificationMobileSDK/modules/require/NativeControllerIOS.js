define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
  var NativeControllerIOS = function(componentInstance) {
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
  NativeControllerIOS.prototype.setNotificationStatus =function(txID,status,pwd){
    kony.print("ApproveSDK ---> Android Controller " + txID);
    this.approveSDKWrapper.setNotificationStatusWithStatusWithPasswordWithJSCallbackWithPwdPromptCB(txID, status, pwd, this.componentInstance.onCompletionCallback, this.componentInstance.pwdPromtCallback);
  };
  
  NativeControllerIOS.prototype.retriveTransaction =function(txID,pwd,isBioEnabled){
    return this.approveSDKWrapper.retreiveTransactionWithPasswordIsBioEnabledWithCallback(txID, pwd, isBioEnabled, this.componentInstance.retriveTransactionCallback);
  };
  
  NativeControllerIOS.prototype.checkForBioAvailability = function(){
    return this.approveSDKWrapper.checkBioAvailability();
  };
  
  NativeControllerIOS.prototype.retrievePendingNotifications = function(){
    try{
      this.approveSDKWrapper.retrievePendingNotifications(this.componentInstance.onRecievedNotificationsCallback);
    }catch(e){
      alert("Error " + JSON.stringify(e));
    }
  };
  
  NativeControllerIOS.prototype.updateUsername =function(username){
      this.approveSDKWrapper.setUsername(username);
  };

  return NativeControllerIOS;
});