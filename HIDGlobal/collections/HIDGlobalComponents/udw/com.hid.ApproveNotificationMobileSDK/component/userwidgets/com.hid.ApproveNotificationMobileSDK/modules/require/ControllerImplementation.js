define([], function() {
  var ControllerImplementation = function(componentInstance, componentName) {
    this.componentInstance = componentInstance;
    this.componentName=componentName;
    this.getNativeController = function() {
      try {
        if (this.nativeControllerInstance === undefined) {
          var deviceInfo = kony.os.deviceInfo();
          var platformName = null;
          if (deviceInfo.name.toLowerCase() === 'android') {
            platformName = 'Android';
          }else if (deviceInfo.name.toLowerCase() === 'iphone') {
            platformName = 'IOS';
          }else {
            platformName = 'IOS';//deviceInfo.name.charAt(0).toUpperCase() + deviceInfo.name.slice(1);
          }
          var nativeControllerPath = "com/hid/"+this.componentName+"/NativeController" + platformName + ".js";
          kony.print(nativeControllerPath);
          var nativeController = require(nativeControllerPath);
          this.nativeControllerInstance = new nativeController(this.componentInstance);
        }
        return this.nativeControllerInstance;
      } catch (exception) {
        throw new Error(exception);
      }
    };
    ControllerImplementation.prototype.retriveTransaction = function(txId,password,isBioEnabled){
         return this.getNativeController().retriveTransaction(txId,password,isBioEnabled);
    };
    ControllerImplementation.prototype.setNotificationStatus = function(txId,status,password){
         kony.print("ApproveSDK ---> ControllerImplementation _transactionID " + txId);
         this.getNativeController().setNotificationStatus(txId,status,password);
    };
    ControllerImplementation.prototype.notifyPassword = function(password,mode){
         this.getNativeController().notifyPassword(password,mode);
    };
    ControllerImplementation.prototype.checkForBioAvailability = function(){
           return this.getNativeController().checkForBioAvailability();
    };
       ControllerImplementation.prototype.updateUsername = function(username){
         this.getNativeController().updateUsername(username);
    };
    ControllerImplementation.prototype.retrievePendingNotifications = function(){
      return this.getNativeController().retrievePendingNotifications();
    };
    ControllerImplementation.prototype.updatePassword =function(oldPassword,newPassword){
      this.getNativeController().updatePassword(oldPassword,newPassword);
    };
    ControllerImplementation.prototype.getPasswordPolicy =function(){
      return this.getNativeController().getPasswordPolicy();
    };
  };
  return ControllerImplementation;
});