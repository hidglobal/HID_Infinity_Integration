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
                       platformName = 'IOS';// deviceInfo.name.charAt(0).toUpperCase() + deviceInfo.name.slice(1);
                    }
                    var nativeControllerPath = "com/hid/"+this.componentName+"/NativeController" + platformName + ".js";
                    var nativeController = require(nativeControllerPath);
                    this.nativeControllerInstance = new nativeController(this.componentInstance);
               // }else{
                    //this.updateUsername(this.nativeControllerInstance,this.componentInstance);
                } 
                this.updateUsername(this.nativeControllerInstance,this.componentInstance);
                return this.nativeControllerInstance;
            } catch (exception) {
               throw new Error(exception);
            }
     
        };
        this.updateUsername = function(nativeController,cmpInstance){
           let username = cmpInstance.getUsername();
           kony.print("ApproveSDK --->username  is" + username);
           if(!username || username === ""){
             return;
           }
           nativeController.updateUsername(username);
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
        ControllerImplementation.prototype.updatePasswordExplicit =function(oldPassword,newPassword){
          this.getNativeController().updatePasswordExplicit(oldPassword,newPassword);
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
        ControllerImplementation.prototype.generateOTP = function(pwd,isBiometricEnabled,label = "hotp"){
           return this.getNativeController().generateOTP(pwd,isBiometricEnabled,label);
        };
        ControllerImplementation.prototype.generateOTPExplicit = function(pwd,isBiometricEnabled,label = "hotp"){
           return this.getNativeController().generateOTPExplicit(pwd,isBiometricEnabled,label);
        };
        ControllerImplementation.prototype.renewContainer = function(password){
          return this.getNativeController().renewContainer(password);
        };
        ControllerImplementation.prototype.deleteUserProfile = function(){
          return this.getNativeController().deleteUserProfile();
        };
        ControllerImplementation.prototype.deleteContainerWithAuth = function(password){
           this.getNativeController().deleteContainerWithAuth(password);
        };
        ControllerImplementation.prototype.verifyPassword = function(password,isBiometricEnabled,bioString){
           this.getNativeController().verifyPassword(password,isBiometricEnabled,bioString);
        };
        ControllerImplementation.prototype.getContainerRenewableDate = function(){
          return this.getNativeController().getContainerRenewableDate();
        };
      ControllerImplementation.prototype.setNotificationStatus = function(txtId, status, pin){
          return this.getNativeController().setNotificationStatus(txtId, status, pin);
        };
		ControllerImplementation.prototype.getDeviceProperty = function(){
          return this.getNativeController().getDeviceProperty();
        };
      
    };
    return ControllerImplementation;
});