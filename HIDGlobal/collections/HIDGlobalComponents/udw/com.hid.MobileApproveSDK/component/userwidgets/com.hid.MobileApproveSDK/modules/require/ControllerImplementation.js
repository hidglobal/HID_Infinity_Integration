define([], function() {
  
    var ControllerImplementation = function(componentInstance, componentName) {
      this.componentInstance = componentInstance;
      this.componentName="MobileApproveSDK";
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
        ControllerImplementation.prototype.createContainer = function(qrString){
           this.getNativeController().createContainer(qrString);
        };
        ControllerImplementation.prototype.setPasswordToUser = function(password){
           this.getNativeController().setPasswordToUser(password);
        };
        ControllerImplementation.prototype.updatePassword =function(oldPassword,newPassword){
          this.getNativeController().updatePassword(oldPassword,newPassword);
        };
        ControllerImplementation.prototype.getPasswordPolicy =function(){
          return this.getNativeController().getPasswordPolicy();
        };
        ControllerImplementation.prototype.getLoginFlow = function(pushId){
           return this.getNativeController().getLoginFlow(pushId);
        };
        ControllerImplementation.prototype.enableBioMetrics = function(password){
            this.getNativeController().enableBioMetrics(password);
        };
        ControllerImplementation.prototype.disableBioMetrics = function(){
            this.getNativeController().disableBioMetrics();
        };
        ControllerImplementation.prototype.setBiometricPrompt = function(msg){
            this.getNativeController().setBiometricPrompt(msg);
        };
        ControllerImplementation.prototype.checkForBioAvailability = function(){
           return this.getNativeController().checkForBioAvailability();
        };
        ControllerImplementation.prototype.generateOTP = function(pwd,isBiometricEnabled){
           return this.getNativeController().generateOTP(pwd,isBiometricEnabled);
        };
        ControllerImplementation.prototype.renewContainer = function(password){
          return this.getNativeController().renewContainer(password);
        };
    };
    return ControllerImplementation;
});