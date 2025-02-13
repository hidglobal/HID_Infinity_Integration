define(function() {

  return {
    /**
		 * @function
		 *
		 * @param baseConfig 
		 * @param layoutConfig 
		 * @param pspConfig 
		 */
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this._renderMode = '';
      this._codeText = '';
      this._codeWidth = '';
      this._codeHeight = '';
      this._colorDark = '';
      this._colorLight = '';
      this._correctLevel = '';
      this.qrcodeProperties = {
				width: "100",
                height: "100",
				colorDark: "#000000",
				colorLight: "#ffffff"
			};
    },
    //Logic for getters/setters of custom properties
    /**
		 * @function
		 *
		 */
    initGettersSetters: function() {
      defineGetter(this, 'renderMode', () => {
        return this._renderMode;
      });
      defineSetter(this, 'renderMode', value => {
        this._renderMode = value;
      });
      defineGetter(this, 'codeText', () => {
        return this._codeText;
      });
      defineSetter(this, 'codeText', value => {
        this._codeText = value;
      });
      defineGetter(this, 'codeHeight', () => {
        return this._codeHeight;
      });
      defineSetter(this, 'codeHeight', value => {
        this._codeHeight = value;
      });
      defineGetter(this, 'colorDark', () => {
        return this._colorDark;
      });
      defineSetter(this, 'colorDark', value => {
        this._colorDark = value;
      });
      defineGetter(this, 'colorLight', () => {
        return this._colorLight;
      });
      defineSetter(this, 'colorLight', value => {
        this._colorLight = value;
      });
      defineGetter(this, 'correctLevel', () => {
        return this._correctLevel;
      });
      defineSetter(this, 'correctLevel', value => {
        this._correctLevel = value;
      });
      defineGetter(this, 'codeWidth', () => {
        return this._codeWidth;
      });
      defineSetter(this, 'codeWidth', value => {
        this._codeWidth = value;
      });

    },
    /**
     * @function
     * Genrate QR Code
     */
    _generateQRCode: function(cText = "Temenos QR Code", cWidth = "500", cHeight = "500", cCorrectionLavel = 0, cColorDark = "#000000", cColorLight = "#FFFFFF") {   
      var urlConf = {
        URL: "QRCodeGenerator/setQRCodeProperties.html?t=" + cText + "|w=" + cWidth + "|h=" + cHeight + "|dc=" + cColorDark + "|lc=" + cColorLight + "|cl=" + cCorrectionLavel, 
        requestMethod:constants.BROWSER_REQUEST_METHOD_GET
      };
      this.view.brwsrQRCode.requestURLConfig = urlConf;
    },

    /**
     * @function
     *
     */
    generateQRCode: function(cText) {
      var scopObj = this;
//       var cText = this._codeText;
      var cText = cText;
      var cWidth = this._codeWidth;
      var cHeight = this._codeHeight;
      var cCorrectionLavel = this._correctLevel;
      var cColorDark = this._colorDark;
      var cColorLight = this._colorLight;
      scopObj._generateQRCode(cText, cWidth, cHeight, cCorrectionLavel, cColorDark, cColorLight);
    },

    /**
     * @function
     *
     */
    setContext: function(cText, cWidth, cHeight, cCorrectionLavel, cColorDark, cColorLight) {
      this._codeText = cText;
      this._codeWidth = cWidth;
      this._codeHeight = cHeight;
      this._correctLevel = cCorrectionLavel;
      this._colorDark= cColorDark;
      this._colorLight = cColorLight;
      this.generateQRCode();
    },

    /**
     * @function
     *
     */
    compInit: function() {
      if(this._renderMode == 'Properties') {
        this.generateQRCode();
      }
    },


  };
});