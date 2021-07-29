define([],function () {
  var NativeController=function(componentInstance){
    this.componentInstance=componentInstance;
  };
  /**
     * @function scan
     * @private
     * @description: scan the code
  */
  NativeController.prototype.createContainer = function(){
    throw new Error('createContainer function is not implemented');
  };
  NativeController.prototype.getPasswordPolicy = function(){
    throw new Error('getPasswordPolicy function is not implemented');
  };
  NativeController.prototype.setPasswordToUser = function(){
    throw new Error('setPasswordToUser function is not implemented');
  };
  NativeController.prototype.getLoginFlow = function(){
    throw new Error('checkRegisteredUser function is not implemented');
  }
  NativeController.prototype.enableBioMetrics = function(){
    throw new Error('enableBioMetrics function is not implemented');
  };
  NativeController.prototype.disableBioMetrics = function(){
    throw new Error('enableBioMetrics function is not implemented');
  };
  NativeController.prototype.setBiometricPrompt = function(){
    throw new Error('setBiometricPrompt function is not implemented');
  };
  NativeController.prototype.checkForBioAvailability = function(){
    throw new Error('checkForBioAvailability function is not implemented');
  };
  NativeController.prototype.generateOTP = function(){
    throw new Error('generateOTP function is not implemented');
  };
  NativeController.prototype.renewContainer = function(){
    throw new Error('reNewContainer function is not implemented');
  }
  return NativeController;
});