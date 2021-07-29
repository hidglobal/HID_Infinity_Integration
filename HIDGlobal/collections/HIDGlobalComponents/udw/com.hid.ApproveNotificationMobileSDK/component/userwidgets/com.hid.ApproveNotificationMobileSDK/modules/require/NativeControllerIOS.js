define(['./Inherits', './NativeController', './KonyLogger'], function(Inherits, NativeController, konyLoggerModule) {
  var konymp = konymp || {};
  konymp.logger = (new konyLoggerModule("barcodeqrscanner NativeControllerIOS Component")) || function() {};
  konymp.logger.setLogLevel("DEBUG");
  konymp.logger.enableServerLogging = true; 
  var NativeControllerIOS = function(componentInstance) {
     // Constructor
  };
  Inherits(NativeControllerIOS, NativeController);
  /**
     * @function scan
     * @private
     * @description: scan the code
     */
  
  return NativeControllerIOS;
});