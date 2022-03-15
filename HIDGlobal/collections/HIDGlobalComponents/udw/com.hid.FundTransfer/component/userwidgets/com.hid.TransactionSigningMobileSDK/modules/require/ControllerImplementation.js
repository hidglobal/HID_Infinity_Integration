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
            platformName = deviceInfo.name.charAt(0).toUpperCase() + deviceInfo.name.slice(1);
          }
          var nativeControllerPath = "com/hid/"+this.componentName+"/NativeController" + platformName + ".js";
          var nativeController = require(nativeControllerPath);
          this.nativeControllerInstance = new nativeController(this.componentInstance);
        }
        return this.nativeControllerInstance;
      } catch (exception) {
        throw new Error(exception);
      }
    };
    ControllerImplementation.prototype.signTransaction = function(values){
         this.getNativeController().signTransaction(values);
    };
    ControllerImplementation.prototype.notifyPassword = function(password,mode){
         this.getNativeController().notifyPassword(password,mode);
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