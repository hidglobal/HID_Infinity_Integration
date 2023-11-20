define(['./ControllerImplementation.js', './KonyLogger'], function(ControllerImplementation, konyLoggerModule) {
    var konymp = konymp || {};
    var formref;
    konymp.logger = new konyLoggerModule("barcodeqrscanner/barcodeqrCascannerController");
    return {
        constructor: function(baseConfig, layoutConfig, pspConfig) {
            this._cameraFacing = "Back";
            this.isCameaAdded = false;
            this.format = {
                "1": "CODE_128 or CONTACT_INFO",
                "2": "CODE_39 or EMAIL",
                "4": "CODE_93 or PHONE",
                "8": "CODABAR or URL",
                "16": "DATA_MATRIX",
                "32": "EAN_13",
                "64": "EAN_8",
                "128": "ITF",
                "256": "QR_CODE",
                "512": "UPC_A",
                "1024": "UPC_E",
                "2048": "PDF417",
                "4096": "AZTEC",
                "3": "ISBN",
                "5": "PRODUCT",
                "6": "SMS",
                "7": "TEXT",
                "9": "WIFI",
                "10": "GEO",
                "11": "CALENDAR_EVENT",
                "12": "DRIVER_LICENSE"
            };
            if (this.view.ncScan === undefined || this.view.ncScan === null)
                konymp.logger.trace("Unable to initiate component. Please refresh the project.", konymp.logger.FUNCTION_EXIT);
            this.handler = new ControllerImplementation(this, baseConfig.id);
        },
        myEventObj: "",
        //Logic for getters/setters of custom properties
        initGettersSetters: function() {
            defineSetter(this, "cameraFacing", function(val) {
                try {
                    konymp.logger.trace("----------------------------- Setting imageName Start", konymp.logger.FUNCTION_ENTRY);
                    if (typeof(val) === 'string') {
                        this._cameraFacing = val;
                    } else {
                        throw {
                            error: "InvalidType",
                            message: "Invalid input type. Expecting string."
                        };
                    }
                } catch (e) {
                    konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
                    if (e.error === "InvalidType") {
                        konymp.logger.trace(e.message, konymp.logger.FUNCTION_EXIT);
                    }
                }
                konymp.logger.trace("-----------------------------Setting imageName End", konymp.logger.FUNCTION_EXIT);
            });
            defineGetter(this, "cameraFacing", function() {
                return this._cameraFacing;
            });
            defineSetter(this, "renderAutomatic", function(val) {
                try {
                    konymp.logger.trace("----------------------------- Setting render Start", konymp.logger.FUNCTION_ENTRY);
                    this._render = val;
                } catch (e) {
                    konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
                }
                konymp.logger.trace("-----------------------------Setting render End", konymp.logger.FUNCTION_EXIT);
            });
            defineGetter(this, "renderAutomatic", function() {
                return this._render;
            });
            defineSetter(this, "enableContinuousScanning", function(val) {
                try {
                    konymp.logger.trace("----------------------------- Setting enableContinuousScanning Start", konymp.logger.FUNCTION_ENTRY);
                    this._enableContinuousScanning = val;
                } catch (e) {
                    konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
                }
                konymp.logger.trace("-----------------------------Setting enableContinuousScanning End", konymp.logger.FUNCTION_EXIT);
            });
            defineGetter(this, "enableContinuousScanning", function() {
                try {
                    return this._enableContinuousScanning;
                } catch (e) {
                    konymp.logger.error(JSON.stringify(e), konymp.logger.EXCEPTION);
                }
            });
        },
        /**
         * @function scan
         * @private
         */
        scan: function(eventobject) {
            try {
                if (this._render && !this.isCameaAdded) {
                    this.handler.scan(eventobject, this._cameraFacing);
                    this.isCameaAdded = true;
                }
            } catch (e) {
                this.isCameaAdded = false;
                this.errorCallback(e);
            }
        },
        /**
         * @function resumeScan
         * @exposed
         * @description: API to resume the scan after 1 successful scan
         */
        resumeScan: function() {
            try {
                this.handler.resumeScan();
            } catch (e) {
                this.errorCallback(e);
            }
        },
        /**
         * @function flashControl
         * @exposed
         * @description: API to let user control the flash of camera
         */
        flashControl: function() {
            try {
                if (this.cameraFacing !== "Front")
                    this.handler.flashControl();
                else
                    throw {
                        "message": "Flash is not available for front camera"
                    };
            } catch (e) {
                this.errorCallback(e);
            }
        },
        /**
         * @function release
         * @private
         */
        release: function(eventobject) {
            try {
                this.handler.release(eventobject);
                this.isCameaAdded = false;
            } catch (e) {
                this.isCameaAdded = true;
                this.errorCallback(e);
            }
        },
        renderScan: function(formrefernce) {
          this.formref=formrefernce;
            try {
                if (!this.isCameaAdded) {
                  var eventobject = this.view.ncScan.getContainerView();
                  if(eventobject && !this.isEmpty(eventobject)){
                    this.addScanner(eventobject);
                  } else if(this.isEmpty(eventobject)){
                      kony.print("ScanLib --> eventobject is empty, restarting camera..");
                      this.restartCamera();            
                    }
                }
            } catch (e) {
                this.isCameaAdded = false;
                kony.print("ScanLib --> Inside catch in renderScan: "+JSON.stringify(e));
                this.restartCamera();
            }
        },
        stopScan: function() {
            try {
                var eventobject = this.view.ncScan.getContainerView();
                this.release(eventobject);
                this.view.flxClose.isVisible = false;
                this.view.flxFlash.isVisible = false;
                this.view.flxCamera.isVisible = false;
                this.view.forceLayout();
            } catch (e) {
                this.errorCallback(e);
            }
        },
        toggleCamera: function() {
            try {
                if (this.cameraFacing === "Back")
                    this.cameraFacing = "Front";
                else
                    this.cameraFacing = "Back";
                var eventobject = this.view.ncScan.getContainerView();
                this.release(eventobject);
                if (kony.os.deviceInfo().name.toLowerCase() === "android")
                    kony.timer.schedule("konympBarcodeTimer", function() {
                        this.handler.scan(eventobject, this._cameraFacing);
                    }.bind(this), 1, false);
                else
                    this.handler.scan(eventobject, this._cameraFacing);
                this.isCameaAdded = true;
            } catch (e) {
                this.isCameaAdded = false;
                this.errorCallback(e);
            }
        },
        /**
         * @function afterScan
         * @exposed
         * @description: event exposed to get result after scan
         */
        afterScan: function(result) {
          this.formref.afterScan(result);
        },
        /**
         * @function errorCallback
         * @exposed
         * @description: event when any error is thrown in the component
         */
        errorCallback: function(error) {
          kony.print("ScanLib --> Inside barcodeqrscanner errorCallback: "+JSON.stringify(error));
          if(this.isEmpty(error)){
            kony.print("ScanLib --> Inside isEmpty in errorCallback")
            this.restartCamera();
          }else{
            this.formref.errorCallback(error);
          }         
        },
        /**
         * @function onClickClose
         * @exposed
         * @description: event when click on close button
         */
        onClickClose: function() {
          this.formref.onClickClose();
        },
        isEmpty : function(obj) {
          if(obj === undefined || obj === null){
            return true;
          }
          return JSON.stringify(obj) === JSON.stringify({});
       },
      /**
         * @function addScanner
         * @private
         * @description: For adding scanner if it got lost from the form
         */
        addScanner : function(eventobject){
          this.handler.scan(eventobject, this._cameraFacing);
          this.isCameraAdded = true;
          this.view.flxClose.isVisible = true;
          this.view.flxFlash.isVisible = true;
          this.view.flxCamera.isVisible = true;
          this.view.forceLayout();
        },
    /**
         * @function restartCamera
         * @private
         * @description: For restarting the camera in case of hard close
         */
       restartCamera : function(){
         this.cameraFacing = "Front";
         var eventobject = this.view.ncScan.getContainerView();
         this.release(eventobject);
         let timername = "timer"+ Math.floor(Math.random()*1000);
         kony.timer.schedule(timername, function() {
           this.cameraFacing = "Back";
           eventobject = this.view.ncScan.getContainerView();
           this.release(eventobject);
           this.addScanner(eventobject);
         }.bind(this), 1, false);  
         this.view.forceLayout();
       }
    };
});