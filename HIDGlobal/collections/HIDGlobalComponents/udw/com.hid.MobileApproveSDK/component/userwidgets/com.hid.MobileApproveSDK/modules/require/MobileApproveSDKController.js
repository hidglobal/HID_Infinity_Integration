define([`./approveSDKBusinessController`,`./ControllerImplementation`],function(businessController,controllerImplemetation) {
  var sdkConstants = {};
  sdkConstants.ERROR_USERNAME = `Please enter CustomerID`; 
  sdkConstants.ERROR_ACTIVATIONCODE = `Please enter Activation Code`;
  sdkConstants.ERROR_GENERIC = `Something went wrong please try again later`;
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
  sdkConstants.ERROR_PWD_NOT_MATCH = `Entered PINs do not match`;
  sdkConstants.ERROR_PIN = `PIN is incorrect`;
  sdkConstants.ERROR_SAME_PIN = `Same PIN prohibited`;
  sdkConstants.ERROR_PIN_CHANGE = `PIN can be change after 24 hrs`;
  var contexts = ["ActivationCode","SetPassword","Login","Biometric","Success","UpdatePassword","SetStandardPassword","ProfileResetUI"];
  var getProfileAge = 0;
  var isRegister = false ;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUI();
      this.contextSwitch("ActivationCode");
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
      this.view.btnLogin.onTouchEnd = this.btnLogin_onClick;
      this.nativeController = new controllerImplemetation(this,baseConfig.id);
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {

    },
    passwordExpire_atlogin : false,
    resetPassword : "false",
    pwdMinLength : 5,
    pwdMinDiffChar : 5,
    pwdNotSequence : "true",
    pwdMaxLength : 100,
    pwdNotUserAttribute : "true",
    initiate : function(){
     this.setLoadingScreen(true);
      if(this.isAndroid() && !gblSDKNotificationManager){
        throw new Error("sdkNotificationManager.js not configured");
      }
      var pushID = "";
      if(this.isAndroid()){
         pushID = gblSDKNotificationManager.isUpdateRequired() ? gblSDKNotificationManager.getPushId() : null;
      }
      let flowString = this.nativeController.getLoginFlow(pushID);
      //alert(flowString);
      if(flowString == "Register"){
        isRegister = true ;		  
        this.initActivationFlow();
        return
      }
      let contentArray = flowString.split(",");
      let flow = contentArray[0];
      if(flow == "SingleLogin"){
        this.username = contentArray[1];
        this.initSingleLoginFlow();
        //this.initActivationFlow();
        return;
      }
      if(flow == "MultiLogin"){
        // TODO : Multiple Login flow
      }
    },
    btnChangePassword_onClick(){
      this.contextSwitch("UpdatePassword");
    }, 
    
    getPinRemainingDays : function(){
      var allpolicy = this.nativeController.getPasswordPolicy();
      this.passwordPolicy = JSON.parse(allpolicy);
     
      if(this.passwordPolicy.hasOwnProperty("currentAge") && this.passwordPolicy.currentAge <=this.passwordPolicy.maxAge){
        var remainingAge = this.passwordPolicy.maxAge - this.passwordPolicy.currentAge ;
        kony.print("Remaining age of Current PIN "+ remainingAge);
        return remainingAge;
      }else {
        return 10000;
      }     
    },  
    
    btnUpdatePIN_onClick : function(){
      kony.print("btnUpdatePIN_onClick");
      this.showErrorPassword(false,"");
      this.setLoadingScreen(true);
      if(!this.passwordPolicy){
        kony.print("Fetching getPasswordPolicy");
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
       this.showErrorPin(false,sdkConstants.ERROR_PIN);
      this.setLoadingScreen(true);
      var password = this.view.tbxPinLogin.text;
      if(password == "" || password == null) {
        //this.setLoadingScreen(false);
        this.showErrorPin(true,sdkConstants.ERROR_PWD_NOT_ENTERED);
        return;
      }      
      this.nativeController.generateOTP(password,false);
    },
    generateOTPSuccess : function(otp){
      this.setLoadingScreen(true);
      businessController.validateSecureOTP(this.username,otp,this.validateSecureOTPSuccess,this.validateSecureOTPFailure);      
    },

    generateOTPFailure : function(exceptionType,message){
      if( exceptionType == "AuthenticationException"  || exceptionType == "InvalidPasswordException"){
        this.showErrorPin(true, sdkConstants.ERROR_PIN);
      }
      if(exceptionType == "PasswordExpiredException"){
        this.showErrorPin(true, sdkConstants.ERROR_PIN);
        // Change Password call
//        let passwordExpire_atLogin = true;
        this.passwordExpire_atlogin = true;
        this.resetPassword = "true";
        this.contextSwitch("UpdatePassword");        
      }  
      //this.setLoadingScreen(false);
    },
    validateSecureOTPSuccess : function(){
      this.setLoadingScreen(false);
      if(this.onSuccessCB){
        this.onSuccessCB.call(this);
      }
    },
    validateSecureOTPFailure : function(error){
      this.setLoadingScreen(false);
      alert(JSON.stringify(error));
    },
    initActivationFlow : function(){
      this.contextSwitch("ActivationCode");
      this.setLoadingScreen(false);
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
    btnSetStandardPassword_onClick: function() {
      this.setLoadingScreen(true);
      kony.print("btnSetStandardPassword_onClick init");
      var standardPassword = this.view.tbxStandardPassword.text;
      var cnfstandardPassword = this.view.tbxConfirmStandardPassword.text;
      
      if (standardPassword == "" || standardPassword == null) { 
        this.view.lblErrorStandardPassword.text = "Please enter the password";
        this.view.flxErrorStandardPassword.setVisibility(true);
        this.setLoadingScreen(false);
        return;
      }
      if (cnfstandardPassword == "" || cnfstandardPassword == null ) {
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
      }
      businessController.setStandardPassword(params,this.setStandardPasswordSucess,this.setStandardPasswordFailure);
 //     }
    },
    setStandardPasswordSucess: function(){
      this.setLoadingScreen(false);
      kony.print("In setStandardPasswordSucess");
      this.showSuccessScreen("Device registered successfully with standard password");
    },
    setStandardPasswordFailure: function(){
      this.setLoadingScreen(false);
      this.showSuccessScreen("Device registered successfully without standard password");
    },
    seqCheck: function(s) {
      // Check for sequential numerical characters
      for (let i in s)
        if (+s[+i + 1] == +s[i] + 1 && +s[+i + 2] == +s[i] + 2) return false;
      // Check for sequential alphabetical characters
      for (let i in s)
        if (String.fromCharCode(s.charCodeAt(i) + 1) == s[+i + 1] && String.fromCharCode(s.charCodeAt(i) + 2) == s[+i + 2]) return false;
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
      if(username == "") {
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
      businessController.validateActivatonCode(params,this.validateActivationCodeSucess,this.validateActivationCodeFailure);
      //let invCode = `{"ver":"v8","url":"test.aaas.hidcloud.com:443/td7f7131a5289307306696","uid":"sdkuser1","did":"94124","dty":"DT_TDSV4B","dir":"26205","pch":"CH_TDSPROV","pth":"AT_TDSOOB","sec":"","pss":"ODBHUjA0Q0w1MA=="}`;
      //this.nativeController.createContainer(invCode);
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
      }
      businessController.approveDeviceRegistration(params, this.approveDeviceRegistrationSuccess,this.approveDeviceRegistrationFailure);
    },
    validateActivationCodeFailure : function({ActivationCodeError}){
      this.showError(true, ActivationCodeError);
      this.setLoadingScreen(false);
    },
    approveDeviceRegistrationSuccess : function(success){
      let invCode = success.provisionMsg;
      kony.print(this.username +` ---> ${invCode}`);
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
    
    showErroProfileReset : function(visible,message = 'Please enter valid PIN'){
      this.setLoadingScreen(false);
      if(visible){
        this.view.lblErrorEnterPIN.text = message ;
      }
      this.view.flxErrorConfirmPIN.setVisibility(visible);
    },
    
    exceptionCallback : function(exceptionType,message){
      this.setLoadingScreen(false);
      if(message === "success"){
        kony.print("ApproveSDKComponent ---> enableBioMetrics"); 
        this.nativeController.enableBioMetrics(this.password);   
        return;
      }
      if(exceptionType == "UpdatePassword"){
        if(message == "updateSuccess"){
          this.view.flxErrorPwdPR.setVisibility(false);
          this.view.flxUpdatePassword.setVisibility(false);
          this.view.flxLogin.setVisibility(true);
          
          if(this.onUpdatePasswordCB){ 
            this.onUpdatePasswordCB("success");  
          } 
        }
      } else if(exceptionType == "InvalidPasswordException"){
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
      } else if(exceptionType == "AuthenticationException"){
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
      }else {
        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("error");
        }
      }
  },
    
    checkForFingerPrintStatus(){
      var status = kony.localAuthentication.getStatusForAuthenticationMode(constants.LOCAL_AUTHENTICATION_MODE_TOUCH_ID);
      kony.print("ApproveSDKComponent ---> fingerPrint status " + status);
      if(status != 5000){
        kony.print("Finger Print feature present but not working for the following reason " + status);
        return false;
      }
      return true;
    },
    getRenewableCallbackSuccess: function(tag,message){
      getProfileAge = message;
      kony.print("ApproveSDKWrapper return Profile Age " + getProfileAge);
    },
    
    getKeyProfileAge : function(){
      if(isRegister){
        return -1;
      }
      return getProfileAge;	  
    },
    
    renewContainer : function(password){
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
      if(pwd == "" || confirmPwd == ""){
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
      this.showStandardPasswordUI();
//       this.showSuccessScreen("Device Registered Successfully with Biometrics");
      
    },
    btnBioSkip_onClick : function(){
      this.view.flxBioPrompt.setVisibility(false);
      this.nativeController.disableBioMetrics();
      this.showStandardPasswordUI();
//       this.showSuccessScreen("Device Registered Successfully");
    },
    bioStatusCallback : function(isEnabled,message){
      if(isEnabled){
        this.showBioMetricUI();
      }else{
        this.showStandardPasswordUI();
//         this.showSuccessScreen("Device Registered Successfully");
        kony.print(`Biometric not enabled for the following reason ${message}`);
      }
    },
    
    checkBioAvailablityPublic(){
      return this.nativeController.checkForBioAvailability();
    },
    setBioStatusToEnable(password){
      this.nativeController.enableBioMetrics(password);     
    },
    setBioStatusToDisable(){
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
      kony.timer.schedule("Timer",this.initSingleLoginFlow,3,false);
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
      this.view.forceLayout();
    },
    setLoadingScreen : function(visible){
      this.view.flxLoading.setVisibility(visible);
      this.view.forceLayout();
    },
    resetUI : function(){
      this.showError(false, "");
      this.view.tbxUsername.text = "";
      this.view.tbxActivationCode.text = "";
      this.view.tbxConfirmPassword.text = "";
      this.view.tbxPassword.text = "";
      this.view.tbxCurrentPIN.text = "";
      this.view.tbxNewPIN.text = "";
      this.view.flxBioPrompt.setVisibility(false);
    },
    getUsername : function(){
      return this.username;
    },
    changeUIMode : function(mode){
      let modes = ["SetStandardPassword","UpdatePassword","Login"];
      for(let i of modes){
        this.view[`flx${i}`].setVisibility(i===mode);
      }
      this.resetUI();
    },
    isAndroid : function(){
      var deviceInfo = kony.os.deviceInfo();
      return deviceInfo.name.toLowerCase() === 'android';
    }
  };
});