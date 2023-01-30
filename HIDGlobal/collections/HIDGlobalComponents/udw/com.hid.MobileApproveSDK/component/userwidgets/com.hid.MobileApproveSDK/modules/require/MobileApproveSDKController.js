define([`./approveSDKBusinessController`,`./ControllerImplementation`],function(businessController,controllerImplemetation) {
  var sdkConstants = {};
  sdkConstants.ERROR_USERNAME = `Please enter CustomerID`; 
  sdkConstants.ERROR_ACTIVATIONCODE = `Please enter Activation Code`;
  sdkConstants.ERROR_GENERIC = `Something went wrong please try again`;
  sdkConstants.ERROR_LENGTH_MIN_PIN = `PIN length should be atleast #`;
  sdkConstants.ERROR_LENGTH_MIN = `Password length should be atleast #`;
  sdkConstants.ERROR_LENGTH_MAX = `Password length should be atmost #`;
  sdkConstants.ERROR_LENGTH_MAX_PIN = `PIN length should be atmost #`;
  sdkConstants.ERROR_PWD_MIN_NUM = `Password should contain atleast # numbers`;
  sdkConstants.ERROR_PWD_MAX_NUM = `Password should contain atmost # numbers`;
  sdkConstants.ERROR_PWD_NO_ALPHA = `Password should contain only numbers`;
  sdkConstants.ERROR_PWD_MIN_ALPHA = `Password should contain atleast # letters`;
  sdkConstants.ERROR_PWD_MAX_ALPHA = `Password should contain atmost # letters`;
  sdkConstants.ERROR_PWD_MIN_UPPER = `Password should contain atleast # Uppercase letters`;
  sdkConstants.ERROR_PWD_MAX_UPPER = `Password should contain atmost # Uppercase letters`;
  sdkConstants.ERROR_PWD_MIN_LOWER = `Password should contain atleast # Lowercase letters`;
  sdkConstants.ERROR_PWD_MAX_LOWER = `Password should contain atmost # Lowercase letters`;  
  sdkConstants.ERROR_PWD_MIN_SPL = `Password should contain atleast # special Characters`;
  sdkConstants.ERROR_PWD_MAX_SPL = `Password should contain atmost # special Characters`;
  sdkConstants.ERROR_PWD_NOT_ENTERED = `Please enter PIN`;
  sdkConstants.ERROR_OOB_NOT_ENTERED = `Please enter OTP`;
  sdkConstants.ERROR_PWD_NOT_MATCH = `Entered PINs do not match`;
  sdkConstants.ERROR_PIN = `PIN is incorrect`;
  sdkConstants.ERROR_OOB = `OTP is incorrect`;
  sdkConstants.ERROR_SAME_PIN = `Same PIN prohibited`;
  sdkConstants.ERROR_PIN_CHANGE = `PIN can be change after 24 hrs`;
  sdkConstants.DELETE_USER_CNF_TXT = `You are about to delete your user profile from Major Bank`;
  sdkConstants.DELETE_USER_SUCCESS = "Your profile has been deleted successfuly from Major Bank";
  sdkConstants.DELETE_USER_FAILURE = "Deleting Profile failed, Please try again later";
  sdkConstants.DELETE_UI_MODE_SHOW_CONSENSUS = 0;
  sdkConstants.DELETE_UI_MODE_SHOW_SUCCESS = 1;
  sdkConstants.DELETE_UI_MODE_SHOW_FAILURE = 2;
  sdkConstants.DELETE_UI_MODE_HIDE = 3
  sdkConstants.DELETE_UI_MODE_SHOW_PIN = 4;
  sdkConstants.DELETE_UI_MODE_ERROR_PIN =5;
  sdkConstants.ERROR_USERBLOCK = `User is blocked for Login`;
  sdkConstants.ERROR_OTP_SMS = `Failed to send OTP on the registered mobile number.`;
  sdkConstants.ERROR_OTP_EML = `Failed to send OTP on the registered email.`;
  sdkConstants.ERROR_INVALID_QR_CODE = `Invalid QR code. Do you want to retry?`;
  sdkConstants.ERROR_ALREADY_CONSUMED_QR_CODE = `QR code already consumed.Do you want to retry with new QR code or manual onboarding?`;
  sdkConstants.ERROR_INVALID_SERVICE_URL = `Please enter Service URL`;
  sdkConstants.ERROR_INVALID_USERNAME = `Please enter Username`;
  sdkConstants.ERROR_INVALID_INVITE_CODE = `Please enter Invite Code`;
  sdkConstants.ERROR_INTERNET_CONNECTION = `The internet connection appears to be offline. Do you want to retry?`;
  sdkConstants.ERROR_INTERNET_CONNECTION_GENERIC = `The internet connection appears to be offline.`;
  sdkConstants.ERROR_INVALID_PARAMETER = `The service URL is not valid`
  sdkConstants.ERROR_SERVER_AUTHENTICATION =`Either the User ID or Invite code is incorrect`;
  sdkConstants.ERROR_REMOTE_EXCEPTION =`Either the service URL is incorrect or the service is currently unavailable`;
  sdkConstants.ERROR_INVALID_PIN = `PIN Cannot be Empty`;
  sdkConstants.ERROR_BIO_AUTH_NOT_AVAILABLE = `PIN Cannot be Empty`;
  sdkConstants.ERROR_INVALID_PIN = `PIN Cannot be Empty`;
  sdkConstants.ERROR_BIO_AUTH_NOT_AVAILABLE = `BiometricNotAvailable`;
  sdkConstants.ERROR_INVALID_PIN = `PIN Cannot be Empty`;
  sdkConstants.BIOMETRIC_ERROR_CODE = `5003`;
  sdkConstants.AUTH_EXCEPTION_CODE = `5001`;
  sdkConstants.DEFAULT_BIO_STRING = `Please complete your Biometrics to continue`;
  sdkConstants.ERROR_PWD_MATCH = `New PIN cannot be same as old PIN`
  sdkConstants.ERROR_INVALID_PIN_UPD = `Invalid PIN`
  sdkConstants.ERROR_INVALID_PIN_UPD = `PIN Cannot be Empty`;
  sdkConstants.EXCEPTION_NAME_INVALID_PIN_UPD = `InvalidPinException`;
  sdkConstants.ERROR_CAMERA_ANDROID = `Could not find field WINDOW_FOCUSED_STATE_SET`;
  sdkConstants.PERMISSION_DENIED = `50001`; 
  sdkConstants.PERMISSION_GRANTED = `50002`;
  sdkConstants.ENABLE_PERMISSION = `Please enable the permission in device settings to proceed. Do you want to open settings?`;
  sdkConstants.PWD_CHANGE_TO_SOON = "PIN change is too soon, Please try after 1 day"
  var contexts = ["ActivationCode","QRCode","Manual","SetPassword","Login","Biometric","Success","UpdatePassword","SetStandardPassword","ProfileResetUI","Users","OOB"];
  var getProfileAge = 0;
  var isRegister = false ;
  var ip_url = `https://api.ipify.org/`;
  return {
    username : "",
    app_session_id : "",
    client_ip : "",
    userId : "",
    mfa_key : "",
    TM_Cookie_Sid : "",
    TM_Cookie_Tag : "",
    isCookiesLoaded : true,
    newRequest : "",
    otp : "",
    currentContext : "",
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUI();
//       this.contextSwitch("ActivationCode");
      this.view.tbxPinLogin.onTouchStart= source=>this.showErrorPin(false);
      this.view.tbxActivationCode.onTouchStart = source=>this.showError(false);
      this.view.tbxUsername.onTouchStart = source=>this.showError(false);
      this.view.tbxCurrentPIN.onTouchStart = source=>this.showErrorPassword(false);
      this.view.tbxNewPIN.onTouchStart = source=>this.showErrorPassword(false);
      this.view.tbxPassword.onTouchStart = source=>this.showErrorPassword(false);
      this.view.tbxConfirmPassword.onTouchStart = source=>this.showErrorPassword(false);
      this.view.tbxStandardPassword.onTouchStart = source=>this.view.flxErrorStandardPassword.setVisibility(false);
      this.view.tbxConfirmStandardPassword.onTouchStart = source=>this.view.flxErrorStandardPassword.setVisibility(false);
      this.view.btnValidateActivationCode.onClick = this.btnValidateActivationCode_onClick;
      this.view.btnSetPassword.onClick = this.btnSetPassword_onClick;
      this.view.btnBioYes.onClick = this.btnBioYes_onClick;
      this.view.btnBioSkip.onClick = this.btnBioSkip_onClick;
      this.view.btnSPYes.onClick = this.btnStandardPasswordYes_onClick;
      this.view.btnSPSkip.onClick = this.btnStandardPasswordSkip_onClick;
      this.view.btnUpdatePIN.onClick = this.btnUpdatePIN_onClick;
      this.view.btnConfirmUserPIN.onClick = this.btnConfirmUserPIN_onClick();
      this.view.btnSetStandardPassword.onClick = this.btnSetStandardPassword_onClick;
      this.view.flxHidePassword.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHidePassword.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.flxHideConfirmPassword.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHideConfirmPassword.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.flxHideCurrentPIN.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHideCurrentPIN.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.flxHideNewPIN.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHideNewPIN.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.flxHideStandardPassword.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHideStandardPassword.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.flxHideConfirmStandardPassword.onTouchStart =source => this.hidePassword_onTouchStart(source.id.substring(7));
      this.view.flxHideConfirmStandardPassword.onTouchEnd =source => this.hidePassword_onTouchEnd(source.id.substring(7));
      this.view.segUsers.onRowClick = this.segusers_onRowClick;
      this.view.btnLogin.onTouchEnd = this.btnLogin_onClick;
      this.view.btnDeleteUserPINOk.onClick = this.btnDeleteUserPINOk_onClick;
      this.view.btnDeleteUserPinCancel.onClick = source => this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_HIDE);
      this.view.btnDeleteUserOK.onClick = this.btnDeleteUserOK_onClick;
      this.view.btnDeleteUserCancel.onClick = source => this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_HIDE);
      this.view.btnDeleteUserDone.onClick = source => {this.showDeleteUserPrompt();this.initiate();}
      this.view.PlusSquareLight.onTouchEnd = source => this.initActivationFlow();
      this.nativeController = new controllerImplemetation(this,baseConfig.id);
      this.view.btnConfirmOOB.onClick=this.btnConfirmOOB_onClick;
      this.view.lblResendOTP.onTouchEnd = this.resendOTP_onClick;
      this.view.btnManualLink.onClick = this.initManualFlow;
      this.view.btnValidate.onClick = this.btnValidate_onClick;
      this.view.barcodeqrscanner.afterScan = this.afterScan;
      this.view.barcodeqrscanner.errorCallback = this.errorCallback;
      this.view.barcodeqrscanner.onClickClose = this.onClickClose;
      this.view.btnYesScannerAlert.onClick = this.btnYesScannerAlert_onClick;
      this.view.btnNoScannerAlert.onClick = this.btnNoScannerAlert_onClick;
      this.view.flxScannerAlertUI.setVisibility(false);
    },

    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, "MFA", function() {
        return this._MFA;
      });
      defineSetter(this, "MFA", function(val) {
        if(!["OTP_SMS","OTP_EML"].some(v=>v===val)){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid"
          };
        }
        this._MFA = val;
      });
      //Check for RMS enabled or not.
      defineGetter(this, "isRMSEnabled", function() {
        return this._isRMSEnabled;
      });
      defineSetter(this, "isRMSEnabled", function(val){
        if(!(val) || val === undefined){
          this._isRMSEnabled = false;
        }
        else this._isRMSEnabled = val;
      });
      //Check for RMS Read Only or not.
      defineGetter(this, "isRMSReadOnly", function() {
        return this._isRMSReadOnly;
      });
      defineSetter(this, "isRMSReadOnly", function(val){
        if(!(val) || val === undefined){
          this._isRMSReadOnly = false;
        }
        else this._isRMSReadOnly = val;
      });
      //Check for RMS defined Cookies
      defineGetter(this, "tmCookieSid", function() {
        return this.TM_Cookie_Sid;
      }); 
      defineSetter(this, "tmCookieSid", function(val){
        if(!(val) || val == undefined){
          throw {
            "type": "CUSTOM",
            "message": "TM_COOKIE_SID property is Invalid"
          };
        }
        this.TM_Cookie_Sid = val;
      });//
      defineGetter(this, "tmCookieTag", function(){
        return this.TM_Cookie_Tag;
      }); 
      defineSetter(this, "tmCookieTag", function(val){
        if(!(val) || val == undefined){
          throw {
            "type": "CUSTOM",
            "message": "TM_COOKIE_SID property is Invalid"
          };
        }
        this.TM_Cookie_Tag = val;
      });
      defineGetter(this, "provisionMode", function(){
        return this._provisionMode;
      }); 
      defineSetter(this, "provisionMode", function(val){
        if(!(val) || val == undefined){
          throw {
            "type": "CUSTOM",
            "message": "ProvisionMode property is Invalid"
          };
        }
        this._provisionMode = val;
        });
      defineGetter(this, "otpLabel", function(){
        return this._otpLabel;
      }); 
      defineSetter(this, "otpLabel", function(val){
        if(!["hotp","totp"].some(v=>v===val) ){
          throw {
            "type": "CUSTOM",
            "message": "otpLabel property is Invalid"
          };
        }
        this._otpLabel = val;
      });
    },
    passwordExpire_atlogin : false,
    resetPassword : "false",
    pwdMinLength : 5,
    pwdMinDiffChar : 5,
    pwdNotSequence : "true",
    pwdMaxLength : 100,
    pwdNotUserAttribute : "true",
    state: "",
    initiate : function(){
      this.resetUI();
      this.setLoadingScreen(true);
      if(this.isAndroid() && !gblSDKNotificationManager){
        throw new Error("sdkNotificationManager.js not configured");
      }
      var pushIDFromManager = gblSDKNotificationManager.isUpdateRequired() ? gblSDKNotificationManager.getPushId() : "";
      var pushID = pushIDFromManager || "";
      let flowString = this.nativeController.getLoginFlow(pushID);
      
      if(flowString == "Register"){
        isRegister = true ;		  
        let flow = this._provisionMode;
        let mode = flow === "ACTIVATION_CODE" ? "ActivationCode" : "QRCode" ; 
        this.getModeFlow(mode);
        this.setLoadingScreen(false);
        return ;
      }
      let contentArray = flowString.split(",");
      let flow = contentArray[0];
      if(flow == "SingleLogin"){
        this.username = contentArray[1];
        this.initSingleLoginFlow();
        return;
      }
      if(flow == "MultiLogin"){
        // TODO : Multiple Login flow
        this.initMultiLoginFlow(contentArray[1]);
      }
    },
    
    getLoginFLowPublic : function(){
      return this.nativeController.getLoginFlow("");
    },
    
    getModeFlow : function(mode){
      switch(mode){
        case "ActivationCode":
          this.initActivationFlow();
          break;
        case "QRCode":
          try{
            this.initQRCodeFlow();
          }catch(e){
            this.errorCallback(e);
          }          
          break;
        default:
          this.initActivationFlow();
      }
    },

    parseFlowStringForMultiUser : function(flowString){
      kony.print("ApproveSDK ---> parseFlowStringForMultiUser flowString is " + flowString);
      let users = flowString.split("|");
      var usersJson = [];
      for(let user of users){
        let row = {};
        row.username = user;
        row.avatar = "generic_avatar3.png";
        row.curnt_view = 1;
        row.flxTempRowWrapper = {
          "left" : "0%"
        };
        usersJson.push(row);
      }
      this.view.segUsers.widgetDataMap = {
        "lblUsername" : "username",
        "imgAvatar"  : "avatar",
        "flxTempRowWrapper" : "flxTempRowWrapper"
      };
      this.view.segUsers.setData(usersJson);
    },

    initMultiLoginFlow : function(flowString){
      this.parseFlowStringForMultiUser(flowString);
      this.contextSwitch("Users");
      this.setLoadingScreen(false);
    },

    btnChangePassword_onClick(){
      this.contextSwitch("UpdatePassword");
    }, 
    
    updatePassword : function(oldPassword, newPassword){
      if(!this.passwordPolicy){
        kony.print("HIDSDK => Fetching getPasswordPolicy");
        var policy = this.nativeController.getPasswordPolicy();
        if(policy){
          this.passwordPolicy = JSON.parse(policy) || {};  
        }
      }
      if(!oldPassword || !newPassword){
        this.commonEventEmitter(this.updatePasswordFailure,[sdkConstants.EXCEPTION_NAME_INVALID_PIN_UPD,sdkConstants.ERROR_INVALID_PIN_UPD]);
        return
      }
      if(oldPassword == newPassword){
        this.commonEventEmitter(this.updatePasswordFailure,[sdkConstants.EXCEPTION_NAME_INVALID_PIN_UPD,sdkConstants.ERROR_PWD_MATCH]);
        return;
      }
      if(!this.checkPasswordPolicy(newPassword)){
        let error =   this.view.lblErrorPassword.text || sdkConstants.ERROR_INVALID_PIN_UPD;
        this.commonEventEmitter(this.updatePasswordFailure,[sdkConstants.EXCEPTION_NAME_INVALID_PIN_UPD,error]);
        return;
      }
      this.nativeController.updatePasswordExplicit(oldPassword,newPassword);
    },

    getPinRemainingDays : function(username){
      if(username){
        this.username = username;
      }
      var allpolicy = this.nativeController.getPasswordPolicy();
      this.passwordPolicy = JSON.parse(allpolicy);
      if(this.passwordPolicy.hasOwnProperty("profileExpiryDate")){
        getProfileAge = +this.passwordPolicy.profileExpiryDate;
      }
      if(this.passwordPolicy.hasOwnProperty("currentAge") && this.passwordPolicy.currentAge <=this.passwordPolicy.maxAge){
        var remainingAge = this.passwordPolicy.maxAge - this.passwordPolicy.currentAge ;
        kony.print("Remaining age of Current PIN "+ remainingAge);
        return remainingAge;
      }else {
        return 10000;
      }
    },  

    btnUpdatePIN_onClick : function(){
      kony.print("HIDSDK => btnUpdatePIN_onClick");
      this.showErrorPassword(false,"");
      this.setLoadingScreen(true);
      if(!this.passwordPolicy){
        kony.print("HIDSDK => Fetching getPasswordPolicy");
        var policy = this.nativeController.getPasswordPolicy();
        if(policy){
          this.passwordPolicy = JSON.parse(policy) || {};  
        }
      }
      let oldPwd = this.view.tbxCurrentPIN.text;
      let newPwd = this.view.tbxNewPIN.text;
      let cnfPwd = this.view.tbxConfirmUpdPwd.text;
      if(oldPwd == "" || newPwd == "" || cnfPwd == ""){
        let error = sdkConstants.ERROR_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(newPwd !== cnfPwd){
        this.showErrorPassword(true,sdkConstants.ERROR_PWD_NOT_MATCH);
        return;
      }
      this.password = newPwd;
      if(this.checkPasswordPolicy(newPwd)){
        this.nativeController.updatePassword(oldPwd,newPwd);
      }
    },    

    btnLogin_onClick(){
      kony.print("HIDSDK => btnLogin_onClick");
      this.showErrorPin(false,sdkConstants.ERROR_PIN);
      this.setLoadingScreen(true);
      var password = this.view.tbxPinLogin.text;
      if(password == "" || password == null) {
        //this.setLoadingScreen(false);
        this.showErrorPin(true,sdkConstants.ERROR_PWD_NOT_ENTERED);
        return;
      }
      
      this.nativeController.generateOTP(password,false,this._otpLabel);
    },
    // Function to get Local IP address for RMS
    getMyIpFunction: function(otp){
      try{
        this.otp = otp;
        var url = ip_url;
        var request = new kony.net.HttpRequest();
        this.newRequest = request;
        kony.print("RMS => LocalIP address : "+ this.newRequest);
        request.onReadyStateChange = this.publicIPCallBackFunction;
        request.open(constants.HTTP_METHOD_GET, url, true);
        request.send();
      }catch(ex){
        kony.print(ex.message);
      }
    },  
    // Callback function to receive client_ip for RMS
    publicIPCallBackFunction: function(){
      if(this.client_ip.trim() !=""){
        return;
      }
      if(this.newRequest.readyState == constants.HTTP_READY_STATE_DONE){
        var resString = this.newRequest.response;
        kony.print("RMS => resString : "+resString);
        this.client_ip = resString;
        kony.print("RMS => Ip address from Kony.net " + resString);
        this.rmsLogin(this.otp);
      }
    }, 
    //Changes for RMS to capture risk score
    generateOTPSuccess : function(otp){
      kony.print('HIDSDK => Inside generateOTPSuccess');
      this.setLoadingScreen(true);
      kony.print('HIDSDK => isRMSEnabled:'+this._isRMSEnabled);
      if(this._isRMSEnabled === true) {
        if(this.client_ip.trim() === ""){
          this.getMyIpFunction(otp);
        }else{
          kony.print('RMS => rmsLogin flow called');
          this.rmsLogin(otp);
        }
      }else{
           businessController.validateSecureOTP(this.username,otp,this.validateSecureOTPSuccess,this.validateSecureOTPFailure);      
     }
    },
    // Function for enabling RMS 
    rmsLogin : function(otp){
      kony.print("RMS => Inside rmsLogin");
      this.app_session_id = String(Math.floor(Math.random()*100000));
      HidRmsSDKManager.setRMSAppSessionId(this.app_session_id);
      var tmCookieTAG = this.TM_Cookie_Tag;
      var tmCookieSID = this.TM_Cookie_Sid;
      var rmsInfo = {};
      try{
        kony.print("HIDRMS => Inside try rmsLogin ");
        kony.print("HIDRMS => cookies from SDK " + HidRmsSDKManager.getCookieValues(tmCookieTAG,tmCookieSID));
        rmsInfo = JSON.parse(HidRmsSDKManager.getCookieValues(tmCookieTAG,tmCookieSID));
      }catch(e){
        kony.print("HIDRMS => Inside catch rmsLogin exception :"+JSON.stringify(e));
        rmsInfo = {};
      }
      if(rmsInfo === {} || !rmsInfo.hasOwnProperty(tmCookieTAG) || !rmsInfo.hasOwnProperty(tmCookieSID)){
        this.isCookiesLoaded = false;
      }
//       this.client_ip = HidRmsSDKManager.getClientIP();
      kony.print("RMS => RMS cookies status : "+this.isCookiesLoaded);
      var platform = this.isAndroid() ? "android" : "ios";
      const rmsLoad = {
        "tm_sid" : rmsInfo[tmCookieSID],
        "tm_tag" : rmsInfo[tmCookieTAG],
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id,
        "platform" : platform
      };
       kony.print("RMS => rmsLoad : "+JSON.stringify(rmsLoad));
      businessController.validateSecureOTPWithRMS(this.username,otp,this.validateSecureOTPRMSSuccess,this.validateSecureOTPRMSFailure,rmsLoad);      
    },

    generateOTPFailure : function(exceptionType,message){
      if( exceptionType === "AuthenticationException"  || exceptionType === "InvalidPasswordException"){
        this.showErrorPin(true, sdkConstants.ERROR_PIN);
      }
      if(exceptionType === "PasswordExpiredException"){
        this.showErrorPin(true, sdkConstants.ERROR_PIN);
        // Change Password call
        // let passwordExpire_atLogin = true;
        this.passwordExpire_atlogin = true;
        this.resetPassword = "true";
        this.contextSwitch("UpdatePassword");        
      }  
    },  
    // callback function for validating secure otp success while RMS enabled
    validateSecureOTPRMSSuccess : function(response){
      kony.print('RMS => Inside validateSecureOTPRMSSuccess');
      alert(JSON.stringify(response.mfa_meta.rms));
      this.mfa_key = response.mfa_meta.auth_id;
      var status = response.mfa_meta.rms.RMSServiceStatus;
      var noStepup = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "false";
      var stepUp = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "true";
      if(noStepup && status === "success"){
        //If isRMSReadOnly then donot perform stepdown
        kony.print("RMS => isRMSReadOnly:"+this._isRMSReadOnly);
        //if(this._isRMSReadOnly == false){
          this.updateRMSServiceEvent("STEP_DOWN");
          return;
        //}
      }else{
          if(this._isRMSReadOnly === false){
           this.initiateSecondFactor();
           this.client_ip = "";
          }else{
             //RMS ReadyOnly
             this.updateRMSServiceEvent("STEP_DOWN");
             return;
          }
      }
    }, 
     // callback function for receiving secure otp failure while RMS enabled
    validateSecureOTPRMSFailure : function(error){
      kony.print("RMS => Inside validateSecureOTPRMSFailure");
      if(error){
        if(error.details.message.includes("USER-BLOCK") && error.details.message.includes(-3)){
        this.showErrorPin(true, sdkConstants.ERROR_USERBLOCK);
        } else {
        this.showErrorPin(true, sdkConstants.ERROR_PIN);
        }
      }else{
        this.showErrorPin(true, sdkConstants.ERROR_GENERIC);
      }
    },
    // Function to update RMS server about step down event
    updateRMSServiceEvent : function(rmsevent){
      if(rmsevent === "STEP_DOWN"){
        businessController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onStepDownSuccessCB, this.onStepDownFailureCB );
      } 
    },
    // Callback function to validate step down success with RMS
    onStepDownSuccessCB : function(response){
      this.mfa_key = "";
      this.client_ip = "";
      if(this.onSuccessCB){
        this.onSuccessCB.call(this);
      }
      this.setLoadingScreen(false);
      this.resetUI();
    },
    // Callback function to receive step down failure with RMS
    onStepDownFailureCB : function(error){
      this.view.lblErrorPasswordLogin.text = "Something went wrong Please after sometime " + error;
      this.setLoadingScreen(false);
    },
    // Function to perform Step-Up in case of high risk score with RMS enabled by sending otp over mobile/email
    initiateSecondFactor : function(){
      kony.print("RMS => Inside initiateSecondFactor")
      if(this._MFA === "OTP_SMS" || this._MFA === "OTP_EML"){
        let factor = this._MFA;
        let authType = factor === "OTP_SMS" ? "AT_OOBSMS":"AT_OOBEML";
        if(this._MFA === "OTP_HWT"){
            authenticatorType = "AT_OTP";
        }
        let params = {"username" : this.username,
                  "AuthenticationType" : authType};
//         alert(JSON.stringify(params));
       businessController.sendOOB(params, this.sendOTPSuccess, this.sendOTPFailure);
      }
    }, 
    // Function to resend otp(second factor) while performing Step-Up
    resendOTP_onClick : function(){
      this.setLoadingScreen(true);
       this.initiateSecondFactor();
       this.resetUI();
    },
    //Callback Function to validate send otp success for RMS
    sendOTPSuccess : function(response){
      this.setLoadingScreen(false);
      this.resetUI();
      kony.print("RMS => Inside sendOTPSuccess : "+JSON.stringify(response));
      switch(this._MFA){
        case "OTP_SMS":
          this.view.lblOTPtext.text = "HID Out Of Band SMS OTP";
          break;
        case "OTP_EML":
          this.view.lblOTPtext.text = "HID Out of Band Email OTP";
          break;
        default:
          this.view.lblOTPtext.text = "HID Out Of Band SMS OTP";
      }
      this.contextSwitch("OOB");
      
    }, 
    //Callback Function to receive send otp failure for RMS
    sendOTPFailure : function(error){
      kony.print("RMS => Inside sendOTPFailure : " +JSON.stringify(error));
      var errorFunc = this.currentContext === "Login" ? this.showErrorPin : this.showErrorOOB;
      switch(this._MFA){
        case "OTP_SMS":
          errorFunc.call(this,true, sdkConstants.ERROR_OTP_SMS);
          break;
        case "OTP_EML":
          errorFunc.call(this,true, sdkConstants.ERROR_OTP_EML);
          break;
        default:
          errorFunc.call(this,true, sdkConstants.ERROR_GENERIC);
      }
    }, 
    btnConfirmOOB_onClick(){
      kony.print("RMS => Inside btnConfirmOOB_onClick");
      this.showErrorOOB(false,sdkConstants.ERROR_OOB);
      this.setLoadingScreen(true);
      var OOB = this.view.tbxOTP.text;
      if(OOB === "" || OOB === null) {
        this.showErrorOOB(true,sdkConstants.ERROR_OOB_NOT_ENTERED);
        return;
      } 
      this.view.lblErrorOTP.text = "";
      businessController.authenticateSecondFactor(this.username, this._MFA, OOB, this.mfa_key, this.AuthSuccess, this.AuthFailure);
    },
    // Callback function to validate second factor success for RMS
    AuthSuccess : function(response){
      kony.print("RMS => Inside AuthSuccess");
      this.setLoadingScreen(false);
      this.resetUI();
      if(this.onSuccessCB){
        this.onSuccessCB.call(this);
      }
      this.mfa_key = "";
      this.client_ip = "";
    }, 
    // Callback function to receive second factor failure for RMS
    AuthFailure : function(error){
      this.setLoadingScreen(false);
       this.resetUI();
      kony.print("RMS => Inside AuthFailure error:"+JSON.stringify(error));           
      this.showOTPError(true,sdkConstants.ERROR_OOB);
    },
    showOTPError : function(visible,msg = ""){
      this.view.lblErrorOTP.text = msg;
      this.view.flxErrOTP.setVisibility(visible);
    },
    validateSecureOTPSuccess : function(){
      this.setLoadingScreen(false);
      this.resetUI();
      if(this.onSuccessCB){
        this.onSuccessCB.call(this);
      }
    },   
    validateSecureOTPFailure : function(error){
      this.showErrorPin(true, sdkConstants.ERROR_GENERIC);
    },
    initActivationFlow : function(){
      this.state = "ActivationCode";
      this.contextSwitch("ActivationCode");
      this.setLoadingScreen(false);
    },
    initManualFlow : function(){
      kony.print("ScanLib --> Inside initManualFlow method ");
      this.state = "Manual";
      this.view.barcodeqrscanner.stopScan();
      this.view.flxScannerAlertUI.setVisibility(false);
      this.contextSwitch("Manual");
      this.setLoadingScreen(false);
    },
    btnValidate_onClick : function(){
      this.resetUI();
      kony.print("ScanLib --> Inside btnValidate_onClick method ");
      let serviceUrl = this.view.tbxServiceUrl.text;
      let username = this.view.tbxUsernameManual.text;
      let inviteCode = this.view.tbxInviteCode.text;
      
      if(serviceUrl === null || serviceUrl ===""){
        this.showErrorManual(true, sdkConstants.ERROR_INVALID_SERVICE_URL);
        return;
      }
      if(username === null || username ===""){
        this.showErrorManual(true, sdkConstants.ERROR_INVALID_USERNAME);
        return;
      }
      if(inviteCode === null || inviteCode ===""){
        this.showErrorManual(true, sdkConstants.ERROR_INVALID_INVITE_CODE);
        return;
      }
      this.username =username;
      var params = {
        "serviceurl": serviceUrl,
        "userid": username,
        "invitecode": inviteCode
       }; 
      let activationCode = JSON.stringify(params);
      kony.print(`ScanLib --> manual provisioning Object: ${activationCode}`);
      this.setLoadingScreen(true);
      let networkStatus = this.checkIfNetworkIsAvailable();
      if(networkStatus === true){
      this.nativeController.createContainer(activationCode);
      } else{
        this.showErrorManual(true,sdkConstants.ERROR_INTERNET_CONNECTION_GENERIC);
        this.setLoadingScreen(false);
      }
    },
    initQRCodeFlow : function(){
      kony.print("ScanLib --> Inside initQRCodeFlow method ");
      this.state = "QRCode";
      this.contextSwitch("QRCode");
      this.setLoadingScreen(false);
      let networkStatus = this.checkIfNetworkIsAvailable();
      if(networkStatus === true){
      this.permissionCheck();
      } else {
          this.scannerAlertHandlerUI(sdkConstants.ERROR_INTERNET_CONNECTION);
       }
    },
    permissionCheck : function(){
      var permission = kony.application.checkPermission(kony.os.RESOURCE_CAMERA);
      kony.print("ScanLib --> permission status :"+ permission.status);
      kony.print("ScanLib --> can request permission :"+ permission.canRequestPermission);
      if(permission.status === kony.application.PERMISSION_DENIED){
        kony.print("ScanLib --> permission denied");
        if(permission.canRequestPermission){
          kony.application.requestPermission(kony.os.RESOURCE_CAMERA, this.permissionStatusCallback);
        } else {
          this.scannerAlertHandlerUI(sdkConstants.ENABLE_PERMISSION);
        }
      } else if(permission.status === kony.application.PERMISSION_GRANTED){
          kony.print("ScanLib --> permission granted");
          this.view.barcodeqrscanner.renderScan(this);         
       }
    },
    permissionStatusCallback : function(response){
      if(response.status === kony.application.PERMISSION_GRANTED){
        kony.print("ScanLib --> permission granted");
        this.initQRCodeFlow();        
      } else {
          this.scannerAlertHandlerUI(sdkConstants.ENABLE_PERMISSION);
      }
    },
    permissionSettingCallback : function(resp){
      if(resp){
        kony.application.openApplicationSettings();
      } else {
        try{
          this.initManualFlow();
          this.view.barcodeqrscanner.stopScan();
        } catch(err){
          kony.print("Error while redirecting to Manual Onboarding: "+err);
        }
      }
    },
    scannerAlertHandler : function(resp){
      if(resp){
        this.initQRCodeFlow();
      } else {
         try{
            kony.application.exit(0);
          } catch(err){
            kony.print("Error while closing the app: "+err);
          }
      }       
    },
    scannerAlertHandlerUI : function(message){
      this.view.lblScannerAlertMessage.text = message;
      this.view.flxScannerAlertUI.setVisibility(true);
      this.view.forceLayout();
    },
    btnYesScannerAlert_onClick : function(){
      let message = this.view.lblScannerAlertMessage.text;
      if(message === sdkConstants.ENABLE_PERMISSION){
        this.view.lblScannerAlertMessage.text = "";
        this.view.flxScannerAlertUI.setVisibility(false);
        this.permissionSettingCallback(true);        
      }else{
        this.view.lblScannerAlertMessage.text = "";
        this.view.flxScannerAlertUI.setVisibility(false);
        this.scannerAlertHandler(true);
      }
    },
    btnNoScannerAlert_onClick : function(){
      let message = this.view.lblScannerAlertMessage.text;
      if(message === sdkConstants.ENABLE_PERMISSION){
        this.view.lblScannerAlertMessage.text = "";
        this.view.flxScannerAlertUI.setVisibility(false);
        this.permissionSettingCallback(false);
      }else{
        this.view.lblScannerAlertMessage.text = "";
        this.view.flxScannerAlertUI.setVisibility(false);
        this.scannerAlertHandler(false);
      }      
    },
    afterScan : function(result){
      kony.print("ScanLib --> Inside afterScan Callback method ");
      kony.print("ScanLib --> result from scanner"+JSON.stringify(result));
      if(result !==null && result.includes("url") && result.includes("uid")){
        let invCode = result;
        kony.print("ScanLib --> QR provisioning Object :"+invCode);
        this.setLoadingScreen(true);
        let networkStatus = this.checkIfNetworkIsAvailable();
        if(networkStatus === true){
          this.nativeController.createContainer(invCode);
        } else {
          kony.print("ScanLib --> error internet connection");
          this.scannerAlertHandlerUI(sdkConstants.ERROR_INTERNET_CONNECTION);
        }                     			
       } else {
         kony.print("ScanLib --> error invalid qr code");
         this.scannerAlertHandlerUI(sdkConstants.ERROR_INVALID_QR_CODE);
        }       
     },
    errorHandler : function(resp){
      kony.print("ScanLib --> Inside errorHandler");
      if(resp){
            this.initQRCodeFlow();   
      } else {
         try{
            kony.application.exit(0);
          } catch(err){
            kony.print("Error while closing the app: "+err);
          }
      }  
    },
    errorCallback : function(error){
      kony.print("ScanLib --> Inside errorCallback method: "+JSON.stringify(error));
      if(this.isEmpty(error)){
        kony.print("ScanLib --> Inside error isEmpty: true ");
        this.errorHandler(true);
      }else{
        this.scannerAlertHandlerUI("Please click yes to continue..");
      }    
    },
    onClickClose : function(){
      try{
        this.initManualFlow();
        this.view.barcodeqrscanner.stopScan();
      } catch(err){
        kony.print("Error while redirecting to Manual Onboarding: "+err);
      }
    },
    isEmpty : function(obj) {
      if(obj === undefined || obj === null){
        return true;
      }
      return JSON.stringify(obj) === JSON.stringify({});
    },
    initSingleLoginFlow : function(){
      this.view.tbxUsernameLogin.text = this.username;
      this.view.tbxUsernameLogin.setEnabled(false);
      this.contextSwitch("Login");
      this.setLoadingScreen(false);
      var status = this.nativeController.checkForBioAvailability(); 
      kony.print(`Bio avaliability is ${status}`);
      if(status){
        this.nativeController.generateOTP("",true);
      }
    },
    getSecureCode : function(pin,username){
      if(username){
        this.username = username;
      }
     let isEnabled = false;
		if(pin === "" || pin === null){
			isEnabled = this.nativeController.checkForBioAvailability();
			if(!isEnabled){
              return;
			}
		}
      this.nativeController.generateOTPExplicit(pin,isEnabled,this._otpLabel);
    },
    secureCodeSuccess : function(otp){
      this.commonEventEmitter(this.secureCodeSuccess,[otp]);
    },
    secureCodeFailure : function(exceptionType,message){
      this.commonEventEmitter(this.secureCodeFailure,[exceptionType,message]);
    },

    btnSetStandardPassword_onClick: function() {
      this.setLoadingScreen(true);
      kony.print("btnSetStandardPassword_onClick init");
      var standardPassword = this.view.tbxStandardPassword.text;
      var cnfstandardPassword = this.view.tbxConfirmStandardPassword.text;

      if (standardPassword === "" || standardPassword === null) { 
        this.view.lblErrorStandardPassword.text = "Please enter the password";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (cnfstandardPassword === "" || cnfstandardPassword === null ) {
        this.view.lblErrorStandardPassword.text = "Please confirm the password";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }

      //      if(this.view.tbxStandardPassword.text && this.view.tbxConfirmStandardPassword.text){

      if (this.view.tbxConfirmStandardPassword.text !== this.view.tbxStandardPassword.text) {
        this.view.lblErrorStandardPassword.text = "Passwords do not match";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      var s = this.view.tbxStandardPassword.text;
      if (s.length < this.pwdMinLength || s.length > this.pwdMaxLength) {
        this.view.lblErrorStandardPassword.text = `Password should be minimum ${this.pwdMinLength} and maximum ${this.pwdMaxLength} characters`;
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (s.search(/[a-z]/i) < 0) {
        this.view.lblErrorStandardPassword.text = "Your password must contain at least one letter.";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (s.search(/[0-9]/) < 0) {
        this.view.lblErrorStandardPassword.text = "Your password must contain at least one digit.";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (this.pwdNotSequence === "true" && !this.seqCheck(s)) {
        this.view.lblErrorStandardPassword.text = "Password should not contain a number or letter sequence";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if(this.pwdNotUserAttribute === "true" && this.checkUsernameInPassword(s)){
        this.view.lblErrorStandardPassword.text = "Password should not contain CustomerID";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (!this.UniqueCount(s)) {
        this.view.lblErrorStandardPassword.text = "Password should contain minimum 5 different characters";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      var password = this.view.tbxConfirmStandardPassword.text;
      var params = {
        "username": this.username,
        "password": password,
        "userId": this.userId
      };
      businessController.setStandardPassword(params,this.setStandardPasswordSucess,this.setStandardPasswordFailure);
      //     }
    },
    setStandardPasswordSucess: function(){
      this.setLoadingScreen(false);
      kony.print("In setStandardPasswordSucess");
      this.showSuccessScreen("Device registered successfully with standard password");
      if(this._isRMSEnabled === true){
          this.addOOBToUser(this.userId);
      } 
    },
    setStandardPasswordFailure: function(){
      this.setLoadingScreen(false);
      this.showSuccessScreen("Device registered successfully without standard password");
      if(this._isRMSEnabled === true){
          this.addOOBToUser(this.userId);
      } 
    },
    seqCheck: function(s) {
      // Check for sequential numerical characters
      for (let i in s)
        if (+s[+i + 1] === +s[i] + 1 && +s[+i + 2] === +s[i] + 2) return false;
      // Check for sequential alphabetical characters
      for (let i in s)
        if (String.fromCharCode(s.charCodeAt(i) + 1) === s[+i + 1] && String.fromCharCode(s.charCodeAt(i) + 2) === s[+i + 2]) return false;
      return true;
    },
    UniqueCount: function(nonUnique) {
      var unique = nonUnique.split('').filter(function(item, i, ar) {
        return ar.indexOf(item) === i;
      }).join('');
      return unique.length >= this.pwdMinDiffChar;
    },
    checkUsernameInPassword(pwd){
      var username = this.username.toLowerCase();
      var pwdLower =  pwd.toLowerCase();
      return pwdLower.includes(username);
    },
    btnValidateActivationCode_onClick : function(){
      this.setLoadingScreen(true);
      var username = this.view.tbxUsername.text;
      var activationCode = this.view.tbxActivationCode.text;
      if(username === "") {
        this.setLoadingScreen(false);
        this.showError(true,sdkConstants.ERROR_USERNAME);
        return;
      }
      if (activationCode === "") {
        this.setLoadingScreen(false);
        this.showError(true,sdkConstants.ERROR_ACTIVATIONCODE);
        return;
      }
      this.username = username;
      var params = {
        "filter": username,
        "activationCode": activationCode,
        "username": username
      };
      let networkStatus = this.checkIfNetworkIsAvailable();
      if(networkStatus === true){
      businessController.validateActivatonCode(params,this.validateActivationCodeSucess,this.validateActivationCodeFailure);
      } else {
		this.showError(true,sdkConstants.ERROR_INTERNET_CONNECTION_GENERIC);
        this.setLoadingScreen(false);
       }  
    },
    validateActivationCodeSucess : function(success){
      this.userId = success.userid;
      var userId = this.userId;
      var username = this.username;
      var randNo = Math.floor(Math.random() * 10000);
      var params = {
        "UserId": userId,
        "username": username,
        "usernameWithRandomNo": `${username}.${randNo}`
      };
      businessController.approveDeviceRegistration(params, this.approveDeviceRegistrationSuccess,this.approveDeviceRegistrationFailure);
    },
    validateActivationCodeFailure : function({ActivationCodeError}){
      this.showError(true, ActivationCodeError);
      this.setLoadingScreen(false);
    },
    approveDeviceRegistrationSuccess : function(success){
      
      let invCode = success.provisionMsg;
      kony.print(`HID => Inside approveDeviceRegistrationSuccess : `+this.username +` ---> ${invCode}`);
      //let invCode = `${rawString}`;      
      this.nativeController.createContainer(invCode);         
    },
    approveDeviceRegistrationFailure : function(failure){
      this.showError(true, sdkConstants.ERROR_GENERIC);
      this.setLoadingScreen(false);
    },
    showError : function(visible,message = 'Something went wrong please try again'){
      if(visible){
        this.view.lblErrActivationCode.text = message;
      }
      this.view.lblErrActivationCode.setVisibility(visible);
    },
    showErrorManual : function(visible, message = 'Something went wrong please try again'){
      if(visible){
        this.view.lblErrorManual.text = message;
      }
      this.view.flxErrManual.setVisibility(visible);
    },
    showErrorPassword : function(visible,message = 'Please enter Valid Password'){
      if(visible){
        this.view.lblErrorPassword.text = message;
        this.view.lblErrorPasswordPR.text = message;
      }
      this.view.flxErrorPwd.setVisibility(visible);
      this.view.flxErrorPwdPR.setVisibility(visible);
      this.setLoadingScreen(false);
    },
    showErrorPin : function(visible,message = 'Please enter valid PIN'){
      this.setLoadingScreen(false);
      if(visible){
        this.view.lblErrorPasswordLogin.text = message;        
      }
      this.view.flxErrLogin.setVisibility(visible);      
    },
    showErrorOOB : function(visible,message = 'Please enter valid OTP'){
      this.setLoadingScreen(false);
      if(visible){
        this.view.lblErrorOTP.text = message;        
      }  
      this.view.flxErrOTP.setVisibility(visible);
    },

    showErroProfileReset : function(visible,message = 'Please enter valid PIN'){
      this.setLoadingScreen(false);
      if(visible){
        this.view.lblErrorEnterPIN.text = message ;
      }
      this.view.flxErrorConfirmPIN.setVisibility(visible);
    },
    
    updatePwdCallbackInternalComponent : function(exceptionType,message){
      if(exceptionType === "UpdatePassword"){
        if(message === "updateSuccess"){
          this.view.flxErrorPwdPR.setVisibility(false);
          this.view.flxUpdatePassword.setVisibility(false);
          this.view.flxLogin.setVisibility(true);

          if(this.onUpdatePasswordCB){ 
            this.onUpdatePasswordCB("success");  
          } 
        }
      } else if(exceptionType === "InvalidPasswordException"){
        kony.print("ApproveSDK ---> InvalidException");
        this.view.flxErrorPwdPR.setVisibility(true);
        if(message === "Same password prohibited")
        {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_SAME_PIN;
        }
        else if(message ==="Password change is too soon (minimum age 1, current 0 days)")
        {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_PIN_CHANGE;
        }else {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_GENERIC;
        }

        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("invalidPassword");
        }
      }
    },
    
    updatePwdCallbackInternal : function(exceptionType,message = "Something went wrong please try again"){
        if(message.includes("104") || message.includes("too soon")){
           message = sdkConstants.PWD_CHANGE_TO_SOON;
        }
        if(message == "updateSuccess"){
          this.commonEventEmitter(this.updatePasswordSuccess,["success"]);
        }else{
          this.commonEventEmitter(this.updatePasswordFailure,[exceptionType,message])
        }
    },

    exceptionCallback : function(exceptionType,message){
      this.setLoadingScreen(false);
      if(message === "success"){
        kony.print("ApproveSDKComponent ---> enableBioMetrics"); 
        this.nativeController.enableBioMetrics(this.password);   
        return;
      }
      if(exceptionType === "UpdatePassword"){
        if(message === "updateSuccess"){
          this.view.flxErrorPwdPR.setVisibility(false);
          this.view.flxUpdatePassword.setVisibility(false);
          this.view.flxLogin.setVisibility(true);

          if(this.onUpdatePasswordCB){ 
            this.onUpdatePasswordCB("success");  
          } 
        }
      } else if(exceptionType === "InvalidPasswordException"){
        kony.print("ApproveSDK ---> InvalidException");
        this.view.flxErrorPwdPR.setVisibility(true);
        if(message === "Same password prohibited"){
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_SAME_PIN;
        }
        else if(message ==="Password change is too soon (minimum age 1, current 0 days)"){
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_PIN_CHANGE;
        }else {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_GENERIC;
        }
        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("invalidPassword");
        }
      } else if(exceptionType === "InvalidParameterException"){
        kony.print("ApproveSDK ---> InvalidParameterException");
        if(!this.isAndroid()){
          if(this.state === "Manual"){
            this.showErrorManual(true, sdkConstants.ERROR_INVALID_PARAMETER);
          } else {
            this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
          } 
        }else{
          if(this.state === "Manual"){
          this.showErrorManual(true, sdkConstants.ERROR_INVALID_PARAMETER);
          } else {
            this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
          }
        }
      } else if(exceptionType === "RemoteException"){
        kony.print("ApproveSDK ---> RemoteException");
        if(!this.isAndroid()){
          if(this.state === "Manual"){
            this.showErrorManual(true, sdkConstants.ERROR_REMOTE_EXCEPTION);         
            } else if(this.state === "QRCode"){
              this.scannerAlertHandlerUI(sdkConstants.ERROR_INVALID_QR_Code);
            } else {
              this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
            }
          }else{
            if( this.state === "Manual"){
            this.showErrorManual(true, sdkConstants.ERROR_REMOTE_EXCEPTION);         
            }else if( this.state === "QRCode"){
              this.scannerAlertHandlerUI(sdkConstants.ERROR_INVALID_QR_Code);
            }else{
              this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
            }
          }
      } else if(exceptionType === "ServerAuthenticationException"){
        kony.print("ApproveSDK ---> ServerAuthenticationException");
        if(!this.isAndroid()){
          if(this.state === "Manual"){
            this.showErrorManual(true, sdkConstants.ERROR_SERVER_AUTHENTICATION);         
          }else if(this.state === "QRCode"){
            this.scannerAlertHandlerUI(sdkConstants.ERROR_ALREADY_CONSUMED_QR_CODE);
          }else{
            this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
          }
        }else{
          if(this.state === "Manual"){
            this.showErrorManual(true, sdkConstants.ERROR_SERVER_AUTHENTICATION);
          }else if(this.state === "QRCode"){
            this.scannerAlertHandlerUI(sdkConstants.ERROR_ALREADY_CONSUMED_QR_CODE);
          }else{
            this.showErrorManual(true, sdkConstants.ERROR_GENERIC);
          }
        }
      } else if(exceptionType === "AuthenticationException"){
        kony.print("ApproveSDK ---> AuthenticationException");
        this.view.flxErrorPwdPR.setVisibility(true);
        if(message ==="Password is incorrect")
        {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_PIN;
        }else {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_GENERIC;
        }
        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("invalidPassword");
        }
      } else {
        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("error");
        }
      }
    },

    checkForFingerPrintStatus(){
      var status = kony.localAuthentication.getStatusForAuthenticationMode(constants.LOCAL_AUTHENTICATION_MODE_TOUCH_ID);
      kony.print("ApproveSDKComponent ---> fingerPrint status " + status);
      if(status !== 5000){
        kony.print("Finger Print feature present but not working for the following reason " + status);
        return false;
      }
      return true;
    },
    getRenewableCallbackSuccess: function(tag,message){
      getProfileAge = message;
      kony.print("ApproveSDKWrapper return Profile Age " + getProfileAge);
    },

    getKeyProfileAge : function(username){
      if(username){
        this.username = username;
      }  
      if(isRegister){
        return -1;
      }
      return getProfileAge;	  
    },

    renewContainer : function(password,username){
      if(username){
        this.username = username;
      }  
      this.nativeController.renewContainer(password);
    },

    renewContainerExceptionCB : function(tag, message){
      kony.print("ApproveSDKWrapper renewContainerExceptionCB "+ tag + message);
    },

    // Reset User Profile after Expiry    
    btnConfirmUserPIN_onClick(){
      let password = this.view.tbxPConfirmUserPIN.text; 
      if(password === "" || password === null) {
        //this.setLoadingScreen(false);
        this.showErroProfileReset(true,sdkConstants.ERROR_PIN);
        return;
      }
      this.NativeController.reNewContainer(password);            
    },    

    passwordPromptCallback : function(passwordPolicyString, passwordPolicyObject){
      this.setLoadingScreen(false);
      this.passwordPolicy = JSON.parse(passwordPolicyObject) || {};
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && +this.passwordPolicy.minAlpha === 0){
        // this.view.tbxPassword.textInputMode = constants.TEXTBOX_INPUT_MODE_NUMERIC;
        // this.view.tbxPassword.keyBoardStyle = constants.TEXTBOX_KEY_BOARD_STYLE_NUMBER_PAD;
        this.view.tbxPassword.secureTextEntry = true;
        // this.view.tbxConfirmPassword.textInputMode = constants.TEXTBOX_INPUT_MODE_NUMERIC;
        //this.view.tbxConfirmPassword.keyBoardStyle = constants.TEXTBOX_KEY_BOARD_STYLE_NUMBER_PAD;
        //this.view.tbxConfirmPassword.secureTextEntry = true;
      }
        this.contextSwitch("SetPassword");  
    },
    policyCallback: function(passwordPolicyString, passwordPolicyObject){
      kony.print("PolicyCallback:"+JSON.parse(passwordPolicyObject));
      this.passwordPolicy = JSON.parse(passwordPolicyObject) || {};
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && +this.passwordPolicy.minAlpha === 0){
        //this.view.tbxCurrentPIN.textInputMode = constants.TEXTBOX_INPUT_MODE_NUMERIC;
        //this.view.tbxCurrentPIN.keyBoardStyle = constants.TEXTBOX_KEY_BOARD_STYLE_NUMBER_PAD;
        this.view.tbxCurrentPIN.secureTextEntry = true;
        //this.view.tbxNewPIN.textInputMode = constants.TEXTBOX_INPUT_MODE_NUMERIC;
        //this.view.tbxNewPIN.keyBoardStyle = constants.TEXTBOX_KEY_BOARD_STYLE_NUMBER_PAD;
        this.view.tbxNewPIN.secureTextEntry = true;
      }
    },
    btnSetPassword_onClick : function(){
      this.showErrorPassword(false,"");
      this.setLoadingScreen(true);
      let pwd = this.view.tbxPassword.text;
      let confirmPwd = this.view.tbxConfirmPassword.text;
      if(pwd === "" || confirmPwd === ""){
        let error = sdkConstants.ERROR_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(pwd !== confirmPwd){
        let error = sdkConstants.ERROR_PWD_NOT_MATCH;
        this.showErrorPassword(true,error);
        return;
      }
      this.password = pwd;
      if(this.checkPasswordPolicy(pwd)){
        this.nativeController.setPasswordToUser(pwd);
      }
    },
    hidePassword_onTouchStart : function(widgetId){
      this.view[`tbx${widgetId}`].secureTextEntry =false;
    },
    hidePassword_onTouchEnd : function(widgetId){
      this.view[`tbx${widgetId}`].secureTextEntry =true;
    },
    showBioMetricUI : function(){
      this.view.flxBioPrompt.setVisibility(true);
      this.view.forceLayout();
    },
    btnBioYes_onClick : function(){
      this.view.flxBioPrompt.setVisibility(false);
      kony.print(`Biometric is enabled successfully`);
      if(this.state === "QRCode" || this.state === "Manual"){
         this.showSuccessScreen("Device Registered Successfully");
      }else{
        this.showStandardPasswordUI();  
      }          
      //       this.showSuccessScreen("Device Registered Successfully with Biometrics");
    },
    btnBioSkip_onClick : function(){
      this.view.flxBioPrompt.setVisibility(false);
      this.nativeController.disableBioMetrics();
      if(this.state === "QRCode" || this.state === "Manual"){
         if(this._isRMSEnabled === true){
              this.addOOBToUser(this.userId);
         }
         this.showSuccessScreen("Device Registered Successfully");
      }else{
        this.showStandardPasswordUI();
      }
            
      //       this.showSuccessScreen("Device Registered Successfully");
    },
    bioStatusCallback : function(isEnabled,message){
      if(isEnabled){
        this.showBioMetricUI();
      }else if(this.state === "QRCode" || this.state === "Manual"){
         if(this._isRMSEnabled === true){
              this.addOOBToUser(this.userId);
          }
         this.showSuccessScreen("Device Registered Successfully");
      }else{
        this.showStandardPasswordUI();
        //         this.showSuccessScreen("Device Registered Successfully");
        kony.print(`Biometric not enabled for the following reason ${message}`);
      }
    },

    checkBioAvailablityPublic(username){
      if(username){
        this.username = username;
      }  
      return this.nativeController.checkForBioAvailability();
    },
    setBioStatusToEnable(password,username){
      if(username){
        this.username = username;
      }  
      kony.print("ApproveSDK ---> username while change Bio" + this.username);
      this.nativeController.enableBioMetrics(password);     
    },
    setBioStatusToDisable(username){
      if(username){
        this.username = username;
      } 
      this.nativeController.disableBioMetrics();     
    },
    showStandardPasswordUI : function(){
      this.setLoadingScreen(true);
      businessController.getPasswordPolicy({},this.getSTDPasswordPolicyCB,this.showStandardPasswordUIAfterCB);
    },
    getSTDPasswordPolicyCB : function(success){
      kony.print("ApproveSDK ---> success: ",JSON.stringify(success));
      var obj = success.PasswordPolicy[0];
      kony.print("ApproveSDK ---> pwdPolicy is ",JSON.stringify(obj));
      if(obj.hasOwnProperty("minDiffChars")){
        this.pwdMinDiffChar = +obj.minDiffChars;
      }
      if(obj.hasOwnProperty("minLength")){
        this.pwdMinLength = +obj.minLength;
      }
      if(obj.hasOwnProperty("maxLength")){
        this.pwdMaxLength = +obj.maxLength;
      }
      if(obj.hasOwnProperty("notSequence")){
        this.pwdNotSequence = obj.notSequence;
      }
      if(obj.hasOwnProperty("notUserAttribute")){
        this.pwdNotUserAttribute = obj.notUserAttribute;
      }
      this.showStandardPasswordUIAfterCB();
    },
    showStandardPasswordUIAfterCB : function(){
      kony.print(`In showStandardPasswordUIAfterCB`);
      this.contextSwitch("SetStandardPassword");
      this.view.flxStandardPasswordPrompt.setVisibility(true);
      this.setLoadingScreen(false);
    },
    btnStandardPasswordYes_onClick : function(){
      this.view.flxStandardPasswordPrompt.setVisibility(false);
      //       this.showSuccessScreen("Device Registered Successful with Standard Password");
    },
    btnStandardPasswordSkip_onClick : function(){
      if(this._isRMSEnabled === true){
          this.addOOBToUser(this.userId);
      } 
      this.view.flxStandardPasswordPrompt.setVisibility(false);
      this.showSuccessScreen("Device registered successfully");
    },
    checkPasswordPolicy : function(pwd){
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && +this.passwordPolicy.minAlpha === 0){
        return this.checkPinPolicy(pwd);
      }
      let noOfAlpha = this.countAlphacountAlphabets(pwd);
      let noOfNumeric = this.countNumeric(pwd);
      let noOfLowerCase = this.countLowerCase(pwd);
      let noOfUpperCase = this.countUpperCase(pwd);
      let noOfSpl = this.countSplCharacter(pwd);
      if(this.passwordPolicy.hasOwnProperty("minLength") && pwd.length < +this.passwordPolicy.minLength){
        let error = sdkConstants.ERROR_PWD_MIN_SPL.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxLength") && pwd.length > +this.passwordPolicy.maxLength){
        let error = sdkConstants.ERROR_LENGTH_MAX.replace(/#/,this.passwordPolicy.maxLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && noOfAlpha < +this.passwordPolicy.minAlpha){
        let error = sdkConstants.ERROR_PWD_MIN_ALPHA.replace(/#/,this.passwordPolicy.minAlpha );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxAlpha") && noOfAlpha > +this.passwordPolicy.maxAlpha){
        let error = sdkConstants.ERROR_PWD_MAX_ALPHA.replace(/#/,this.passwordPolicy.maxAlpha );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minNumeric") && noOfNumeric < +this.passwordPolicy.minNumeric){
        let error = sdkConstants.ERROR_PWD_MIN_NUM.replace(/#/,this.passwordPolicy.minNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && noOfNumeric > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_PWD_MAX_NUM.replace(/#/,this.passwordPolicy.maxNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minUpperCase") && noOfUpperCase < +this.passwordPolicy.minUpperCase){
        let error = sdkConstants.ERROR_PWD_MIN_UPPER.replace(/#/,this.passwordPolicy.minUpperCase );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxUpperCase") && noOfUpperCase > +this.passwordPolicy.maxUpperCase){
        let error = sdkConstants.ERROR_PWD_MAX_UPPER.replace(/#/,this.passwordPolicy.maxUpperCase );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minLowerCase") && noOfLowerCase < +this.passwordPolicy.minLowerCase){
        let error = sdkConstants.ERROR_PWD_MIN_LOWER.replace(/#/,this.passwordPolicy.minLowerCase );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxLowerCase") &&  noOfLowerCase > +this.passwordPolicy.maxLowerCase){
        let error = sdkConstants.ERROR_PWD_MAX_LOWER.replace(/#/,this.passwordPolicy.maxLowerCase );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minSpl") && noOfSpl < +this.passwordPolicy.minSpl){
        let error = sdkConstants.ERROR_PWD_MIN_SPL.replace(/#/,this.passwordPolicy.minSpl );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxSpl") && noOfSpl > +this.passwordPolicy.maxSpl){
        let error = sdkConstants.ERROR_PWD_MAX_SPL.replace(/#/,this.passwordPolicy.maxSpl );
        this.showErrorPassword(true,error);
        return false;
      }
    },
    checkPinPolicy : function(pin){
      if(isNaN(pin)){
        let error = sdkConstants.ERROR_PWD_NO_ALPHA;
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minNumeric") && pin.length < +this.passwordPolicy.minNumeric){
        let error = sdkConstants.ERROR_LENGTH_MIN_PIN.replace(/#/,this.passwordPolicy.minNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && pin.length > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_LENGTH_MAX_PIN.replace(/#/,this.passwordPolicy.maxNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      return true;
    },
    countAlphabets : function(pwd){
      return  pwd.replace(/[^a-zA-Z]/g, '').length;
    },
    countNumeric : function(pwd){
      return  pwd.replace(/[^0-9]/g, '').length;
    },
    countUpperCase : function(pwd){
      return pwd.replace(/[^A-Z]/g,'').length;
    },
    countLowerCase : function(pwd){
      return pwd.replace(/[^a-z]/g,'').length;
    },
    countSplCharacter : function(pwd){
      return pwd.replace(/[a-zA-Z0-9]/g,'').length;
    },
    showSuccessScreen: function(successMsg){
      this.view.lblSuccess.text = successMsg;
      this.contextSwitch("Success");
      this.resetUI();
      kony.timer.schedule("Timer",this.initiate,3,false);
    },
    contextSwitch : function(context){
      for(let i of contexts){
        this.view[`flx${i}`].setVisibility(i === context);
      }
      if(context === "Login"){
        if(this.onLoginFlow){
          this.onLoginFlow.call(this);
        }
      }
      this.currentContext = context;
      this.view.forceLayout();
    },
    setLoadingScreen : function(visible){
      this.view.flxLoading.setVisibility(visible);
      this.view.forceLayout();
    },
    resetUI : function(){
      this.showError(false, "");
      this.showErrorManual(false, "");
      this.view.tbxUsername.text = "";
      this.view.tbxActivationCode.text = "";
      this.view.tbxConfirmPassword.text = "";
      this.view.tbxPassword.text = "";
      this.view.tbxCurrentPIN.text = "";
      this.view.tbxPinLogin.text = "";
      this.view.tbxNewPIN.text = "";
      this.view.tbxOTP.text = "";
      this.view.flxBioPrompt.setVisibility(false);
      this.view.flxErrOTP.setVisibility(false);
    },
    segusers_onRowClick : function(){
      let username = this.view.segUsers.selectedRowItems[0].username;
      kony.print("ApproveSDK ---> Username is " + username);
      this.username = username;
      this.initSingleLoginFlow();
    },
    getUsername : function(){
      kony.print("ApproveSDK ---> Username inside component is " + this.username);
      return this.username;
    },
    deleteUserProfile : function(name){
      kony.print("ApproveSDK ---> username to be deleted is " + name);
      if(name){
        this.username = name;
      }  
      let status = this.nativeController.deleteUserProfile();
      return status;
    },
    deleteContainerCallback : function(status){
      kony.print("ApproveSDKWrapper ---> DeleteContainer Status is " + status);
      if(status === "success"){
        kony.print("ApproveSDKWrapper ---> Showing DeleteContainer succes screen");
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_SUCCESS);
      }
      else if(status === "failure"){
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_FAILURE);
      }
      else if(status === "AuthenticationException"){
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_ERROR_PIN);
      }
      else if(status === "NoBioAuth"){
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_PIN);
      }else if(status === "FingerprintException"){
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_PIN);
      }else {
        this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_FAILURE);
      }
    },
    changeUIMode : function(mode){
      let modes = ["SetStandardPassword","UpdatePassword","Login","ActivationCode"];
      for(let i of modes){
        this.view[`flx${i}`].setVisibility(i===mode);
      }
      this.resetUI();
    },
    swipeDetected:function(widgetInfo,swipeInfo){
      try{
        var needToAnimate = false;
        var curRowData = this.view.segUsers.data[swipeInfo.row];
        kony.print("RowData is ---> " + JSON.stringify(curRowData));
        var vw =  curRowData.curnt_view;
        var sd = swipeInfo.swipeDirection;
        kony.print(`ApproveSDKWrapper --->vw   ${vw} sd ${sd}`);
        var fstStepConfig={
          "left": "-20%",
          "stepConfig": {
            "timingFunction": kony.anim.EASE
          }
        };

        var lstStepConfig = {
          "left": "-20%",
          "stepConfig": {
            "timingFunction": kony.anim.EASE
          }
        };

        if(sd===1 && vw===1){
          kony.print("ApproveSDKWrapper ---> reveal del btn");
          fstStepConfig.left = "0%";
          lstStepConfig.left = "-20%";
          curRowData.curnt_view = 2;
          curRowData.flxTempRowWrapper = {
            left : "-20%"
          };
          needToAnimate = true;
        } else if(sd===2 && vw===2){
          kony.print("ApproveSDKWrapper ---> to defautl view");
          fstStepConfig.left = "-20%";
          lstStepConfig.left = "0%";
          curRowData.flxTempRowWrapper = {
            left : "0%"
          };
          curRowData.curnt_view = 1;
          needToAnimate = true;
        }else{
          needToAnimate = false;
        }
        var self = this;
        if(needToAnimate){
          this.view.segUsers.animateRows({
            rows:[{
              sectionIndex : swipeInfo.section,
              rowIndex : swipeInfo.row
            }],
            widgets:["flxTempRowWrapper"],
            animation:{
              definition:kony.ui.createAnimation({
                "0" : fstStepConfig,
                "100": lstStepConfig
              }), 
              config:{
                "delay": 0,
                "iterationCount": 1,
                "fillMode": kony.anim.FILL_MODE_FORWARDS,
                "duration": 0.2,
                "direction": kony.anim.DIRECTION_ALTERNATE
              },
              callbacks:{
                animationEnd : function(){
                  self.view.segUsers.setDataAt(curRowData,swipeInfo.row); 
                  self.view.forceLayout();
                  kony.print(`ApproveSDKWrapper ---> final left is ${curRowData.flxTempRowWrapper.left} and row is ${swipeInfo.row}`);
                }
              }
            }
          });
        }
      }catch(exc){
        alert("exception in swipeHandler!!!!");
      }
    },
    deleteRowDetected:function(widgetInfo,rowData){      
      var curRowData = this.view.segUsers.data[rowData.row];
      kony.print("ApproveSDK  ----> rowData " + JSON.stringify(curRowData));
      this.username = curRowData.username;
      this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_CONSENSUS);
    },
    showDeleteUserPrompt : function(mode=sdkConstants.DELETE_UI_MODE_HIDE){
      var config = {};
      config.consensesTxt = sdkConstants.DELETE_USER_CNF_TXT;
      config.succesMsg = sdkConstants.DELETE_USER_SUCCESS;
      config.errorPin = "";
      switch(mode){
        case sdkConstants.DELETE_UI_MODE_SHOW_CONSENSUS: 
          //Show Consensus Prompt
          config.cnf = false;
          config.consenses = true;
          config.main = true;
          config.pin = false;
          break;
        case sdkConstants.DELETE_UI_MODE_SHOW_SUCCESS:
          //Show Confirmation prompt for Success
          config.cnf = true;
          config.consenses = false;
          config.main = true;
          config.pin = false;
          break;
        case sdkConstants.DELETE_USER_FAILURE:
          //Show Confirmation prompt for Failure
          config.cnf = true;
          config.consenses = false;
          config.main = true;
          config.pin = false;
          config.succesMsg = sdkConstants.DELETE_USER_FAILURE;
          break;
        case sdkConstants.DELETE_UI_MODE_HIDE:
          //Dismiss Prompt;
          config.cnf = false;
          config.consenses = false;
          config.main = false;
          config.pin = false;
          break;
        case sdkConstants.DELETE_UI_MODE_SHOW_PIN:
          //Show Pin;
          config.cnf = false;
          config.consenses = false;
          config.main = true;
          config.pin = true;
          break;
        case sdkConstants.DELETE_UI_MODE_ERROR_PIN:
          //Show Error Pin
          config.cnf = false;
          config.consenses = false;
          config.main = true;
          config.pin = true;
          config.errorPin = sdkConstants.ERROR_PIN;
          break;
        default:
          config.cnf = false;
          config.consenses = false;
          config.main = false;
          config.pin = false;
      }
      this.view.flxDeleteUserConfirmation.setVisibility(config.cnf);
      this.view.flxDeleteUserConsensus.setVisibility(config.consenses);
      this.view.flxDeleteProfile.setVisibility(config.main);
      this.view.flxDeleteUserPin.setVisibility(config.pin);
      this.view.lblDeleteCNF.text = config.succesMsg; 
      this.view.lblDeleteConsenses.text = config.consensesTxt;
      this.view.lblErrorPinDeleteUser.text = config.errorPin;
      this.view.forceLayout();
    },
    btnDeleteUserOK_onClick : function(){
      //this.setLoadingScreen(true);
      //       if(this.isAndroid()){
      //         this.showDeleteUserPrompt(sdkConstants.DELETE_UI_MODE_SHOW_PIN);
      //       } 
      this.nativeController.deleteContainerWithAuth("");
    },
    btnDeleteUserPINOk_onClick : function(){
      if(this.view.tbDeleteUserPin.text === "" || this.view.tbDeleteUserPin.text === null ){
        this.view.lblErrorPinDeleteUser.text = sdkConstants.ERROR_PWD_NOT_ENTERED;
        return;
      }
      this.nativeController.deleteContainerWithAuth(this.view.tbDeleteUserPin.text);
    },
    // To check if data network is available before hitting the api that requires internet
    checkIfNetworkIsAvailable : function() {
      var options = {
        "requestWithPermission" : true
        };
      return kony.net.isNetworkAvailable(constants.NETWORK_TYPE_ANY, options);
    },
    isAndroid : function(){
      var deviceInfo = kony.os.deviceInfo();
      return deviceInfo.name.toLowerCase() === 'android';
    },
    commonEventEmitter(event,args){
      if(event){
        event.apply(this,args);
      }
    },
    konyAlertUI(alertHandlerMethod,message) {
      let basicConfig = {
            alertType : constants.ALERT_TYPE_CONFIRMATION,
            message : message,
            alertHandler : alertHandlerMethod
          };
            let pspConfig = {
              "contentAlignment": constants.ALERT_CONTENT_ALIGN_CENTER
            };
            kony.ui.Alert(basicConfig, pspConfig);               
    },
    //Add OOB AUTH TOUSER
    addOOBToUser : function(userId){
      var authType = this._MFA;
      var authenticatorType = authType === "OTP_SMS" ? "AT_OOBSMS" : "AT_OOBEML";
      var authenticatorValue =  authType === "OTP_SMS" ? "DT_OOBSMS" : "DT_OOBEML";
      if(authType === "OTP_HWT"){
        authenticatorType = "AT_OTP";
      }
      let params = {
        "AuthenticatorType": authenticatorType,
        "userId": userId,
        "AuthenticatorValue": authenticatorValue
      };
      businessController.addOOBToUser(params, this.addOOBToUserSuccess, this.addOOBToUserFailure);
    },
    addOOBToUserSuccess : function(response){
      kony.print("RMS => Inside addOOBToUserSuccess");
    },
    addOOBToUserFailure : function(error){
      kony.print("RMS => Inside addOOBToUserFailure: Error :"+JSON.stringify(error));
      this.setLoadingScreen(false);
    },
    logout : function(username){
      kony.print("RMS => Inside logout");
      this.setLoadingScreen(true);
      this.username = username;
      businessController.logout(this.onLogoutSuccess.bind(this), this.onLogoutFailure.bind(this));
    }, 
    onLogoutSuccess : function(response){
      kony.print("RMS => Inside onLogoutSuccess");
      this.mfa_key = "";
      this.client_ip ="";
      if(this._isRMSEnabled === true){
        this.rmsSessionLogout(this.username);
      } else {
        this.commonEventEmitter(this.onLogout, [response]);
        this.setLoadingScreen(false);
      }
      this.contextSwitch("Login");
      
    }, 
    onLogoutFailure : function(error){
      kony.print("RMS => Inside onLogoutFailure: Error: "+JSON.stringify(error));
      this.commonEventEmitter(this.onLogout, [error]);
      this.setLoadingScreen(false);
//       this.view.lblAuthStatus.text = "Failed to logout";
//       return;
    }, 
    rmsSessionLogout : function(username){
      kony.print("RMS => Inside rmsSessionLogout");
      var session = HidRmsSDKManager.getRMSAppSessionId();
      var platform  = this.isAndroid() ? "android" : "ios";
      let params = {"username" : username, "session":session, "platform" : platform};
      businessController.rmsSessionLogout(params,this.onRmsSessionLogoutSuccess,this.onRmsSessionLogoutFailure);
    },
    onRmsSessionLogoutSuccess: function(response){
      kony.print("RMS => Inside onRmsSessionLogoutSuccess");
      this.commonEventEmitter(this.onLogout, [response]);
      this.setLoadingScreen(false);
    },
    onRmsSessionLogoutFailure: function(error){
      kony.print("RMS => Inside onRmsSessionLogoutFailure: Error:"+JSON.stringify(error));
      this.commonEventEmitter(this.onLogout, [error]);
      this.setLoadingScreen(false);
    },
    
    //Public Function to verify Password
    verifyPassword : function(password,isBioRequired,bioString = sdkConstants.DEFAULT_BIO_STRING){
       let isBioEnabled = this.nativeController.checkForBioAvailability()
       if(isBioRequired){
          if(!isBioEnabled){
              this.commonEventEmitter(this.verifyPasswordCallback,["error",  sdkConstants.ERROR_BIO_AUTH_NOT_AVAILABLE, sdkConstants.BIOMETRIC_ERROR_CODE]);
          }else{
              this.nativeController.verifyPassword(null,true,bioString);
          }
       }else{
         if(password == null || password == ""){
             this.commonEventEmitter(this.verifyPasswordCallback,["error", sdkConstants.ERROR_INVALID_PIN, sdkConstants.AUTH_EXCEPTION_CODE]);
         }else{
             this.nativeController.verifyPassword(password,false,bioString);
         }
       }
    },
    verifyPasswordCallbackInternal : function(status, exception, exception_code){
       this.commonEventEmitter(this.verifyPasswordCallback,[status, exception, exception_code]);
    },
    
    throwCustomError : function(msg){
      throw {
            "type": "HID CUSTOM ERROR",
            "message": msg
      };
    }
 };
}); 