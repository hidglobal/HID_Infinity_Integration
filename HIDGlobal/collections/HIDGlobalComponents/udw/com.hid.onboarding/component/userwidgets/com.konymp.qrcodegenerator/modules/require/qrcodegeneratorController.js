define(function () {
  var konymp = konymp || {};
  var KonyLoggerModule = require("com/konymp/qrcodegenerator/KonyLogger");
  konymp.logger = (new KonyLoggerModule("QR Code Generator Component")) || function () {};
  return {
    constructor: function (baseConfig, layoutConfig, pspConfig) {
      this.isGenerateInvoked=false; 
      this.isWindowLoaded = true;
      var analytics=require("com/konymp/"+"qrcodegenerator"+"/analytics");
      analytics.notifyAnalytics(); 
      this.deviceInfo = kony.os.deviceInfo(); 
      this._qrcodeProperties = {
        width: "100",
        height: "100",
        colorDark: "#000000",
        colorLight: "#ffffff"
      };
      _qrgenerator_Callback = function(){
        this.isWindowLoaded = true;
        if(this.isGenerateInvoked && this.isWindowLoaded){
          this._qrGenerator(this. _dataToEncode);
          this.isGenerateInvoked = false;
        }
      }.bind(this); 
    },
    levels : {
      "Level L":"1",
      "Level M": "2",
      "Level Q":"3",
      "Level H":"4"
    },
    _dataToEncode: null,
    _correctLevel: null,
    //Logic for getters/setters of custom properties
    initGettersSetters: function () {
      defineSetter(this, 'dataToEncode', function (val) {
        konymp.logger.trace("----------------------------- Start Setting dataToEncode", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "") {
          this._dataToEncode = val;
        } else {
          throw {
            message: 'wrong data passed for dataToEncode',
            Error: 'Wrong dataToEncode'
          };
        }
        konymp.logger.trace("----------------------------- End Setting dataToEncode", konymp.logger.FUNCTION_EXIT);
      });
      defineSetter(this, 'qrcodeWidth', function (val) {
        konymp.logger.trace("----------------------------- Start Setting qrcodeWidth", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "" && typeof val === 'string') {
          this._qrcodeProperties.width = val;
        } else {
          throw {
            message: 'wrong data passed for qrcodeWidth',
            Error: 'Wrong qrcodeWidth'
          };
        }
        konymp.logger.trace("----------------------------- End Setting qrcodeWidth", konymp.logger.FUNCTION_EXIT);
      });
      defineSetter(this, 'qrcodeHeight', function (val) {
        konymp.logger.trace("----------------------------- Start Setting qrcodeHeight", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "" && typeof val === 'string') {
          this._qrcodeProperties.height = val;
        } else {
          throw {
            message: 'wrong data passed for qrcodeHeight',
            Error: 'Wrong qrcodeHeight'
          };
        }
        konymp.logger.trace("----------------------------- End Setting qrcodeHeight", konymp.logger.FUNCTION_EXIT);
      });
      defineSetter(this, 'colorLight', function (val) {
        konymp.logger.trace("----------------------------- Start Setting colorLight", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "" && typeof val === 'string') {
          this._qrcodeProperties.colorLight = val;
        } else {
          throw {
            message: 'wrong data passed for colorLight',
            Error: 'Wrong colorLight'
          };
        }
        konymp.logger.trace("----------------------------- End Setting colorLight", konymp.logger.FUNCTION_EXIT);
      });
      defineSetter(this, 'colorDark', function (val) {
        konymp.logger.trace("----------------------------- Start Setting colorDark", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "" && typeof val === 'string') {
          this._qrcodeProperties.colorDark = val;
        } else {
          throw {
            message: 'wrong data passed for colorDark',
            Error: 'Wrong colorDark'
          };
        }
        konymp.logger.trace("----------------------------- End Setting colorDark", konymp.logger.FUNCTION_EXIT);
      });
      defineSetter(this, 'correctLevel', function (val) {

        konymp.logger.trace("----------------------------- Start Setting correctLevel", konymp.logger.FUNCTION_ENTRY);
        if (val !== undefined && val !== null && val !== "" && typeof val === 'string') {
          this._qrcodeProperties.correctLevel = this.levels[val];
        } else {
          throw {
            message: 'wrong data passed for correctLevel',
            Error: 'Wrong correctLevel'
          };
        }
        konymp.logger.trace("----------------------------- End Setting correctLevel", konymp.logger.FUNCTION_EXIT);
      });
    },
    generate: function () {
      try {
        konymp.logger.trace("----------------------------- Start  generate", konymp.logger.FUNCTION_ENTRY);	
        if(!this.isGenerateInvoked){
          this.isGenerateInvoked=true;
        }
        if(this.isWindowLoaded){
          this._qrGenerator(this._dataToEncode); 
        }
        konymp.logger.trace("----------------------------- End generate", konymp.logger.FUNCTION_EXIT);
      } catch (e) {
        konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
      }
    },
    _qrGenerator: function (mytext) {
      try {
        konymp.logger.trace("----------------------------- Start  _qrGenerator", konymp.logger.FUNCTION_ENTRY);
        if (mytext !== undefined && mytext !== null && mytext !== "" && typeof mytext === 'string') {	
          this.view.brsrQRCodeGenerator.evaluateJavaScript("doqr('" + mytext + "','" +
                                                           JSON.stringify(this._qrcodeProperties) + "');");
        } else {
          throw {
            message: 'wrong data passed for mytext',
            Error: 'Wrong text passed'
          };
        }
        konymp.logger.trace("----------------------------- End _qrGenerator", konymp.logger.FUNCTION_EXIT);
      } catch (e) {
        konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
      }
    }
  };
}); 