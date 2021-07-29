define([`com/hid/onboarding/OnboardingPresentationController`], function(OnboardingPresentationController) {
  var contexts = ["Login", "ConfirmPassword","OTP","DeviceRegistration","HW","HWOTP","Approve","RegistrationSuccess","Error"];
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      //this.resetUIFields();
      this.view.btnSignUp.onClick = this.btnLogin_onClick;
      this.view.tbxPassword2.onDone = this.btnLogin_onClick;
      this.view.btnPwdSubmit.onClick = this.btnPwdSubmit_onClick;
      this.view.btnConfirmOTP.onClick = this.btnConfirmOTP_onClick;
      this.view.btnResendApprove.onClick = this.btnResendApproveNotification;
      this.view.btnPushDone.onClick = this.btnPushDone_onClick;
      this.view.btnPwdCancel.onClick = this.btnCancelMain_onClick;
      this.view.btnCancelScanQR.onClick = this.btnCancelMain_onClick;
      this.view.btnRegSuccess.onClick = this.swithcLoginWrapper;
      this.view.btnRegCancel.onClick = this.btnCancelMain_onClick;
      this.view.btnCancelScanQR.onClick = this.btnCancelMain_onClick;
      this.view.btnCancelOTP.onClick = this.btnCancelMain_onClick;
      this.view.btnGoHome.onClick = this.btnCancelMain_onClick;
//       this.view.btnCancleHW.onClick=this.btnCancelMain_onClick;
      this.view.btnSubmitHW.onClick=this.btnSubmitHW_onClick;
      this.view.btnConfirmHWOTP.onClick = this.btnConfirmHWOTP_onClick;
      this.view.btnCancleHWOTP.onClick = this.btnCancelMain_onClick;
      this.contextSwitch("Login");
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, "MFA", function() {
        return this._MFA;
      });
      defineSetter(this, "MFA", function(val) {
        if(!["OTP_SMS","OTP_EML","APPROVE","OTP_HWT"].some(v=>v===val)){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid"
          };
        }
        this._MFA = val;
      });
    },
    username : "",
    userId : "",
    pwdMinLength : 5,
    pwdMinDiffChar : 5,
    pwdNotSequence : "true",
    pwdMaxLength : 100,
    pwdNotUserAttribute : "true",
    deviceSerial : "",
    updateOnboardingUI: function(UIObject) {
      switch (UIObject.state) {
        case "activationCodeSuccess":
          this.activationCodeSuccess(UIObject.response);
          break;
        case "activationCodeFailure":
          this.activationCodeFailure(UIObject.response);
          break;
        case "addPasswordandMFAtoUserFailure":
          this.addPasswordandMFAtoUserFailure(UIObject.response);
          break;
        case "addAndSendOOBSuccess" : 
          this.addAndSendOOBSuccess();
          break;
        case "addAndSendOOBFailure" : 
          this.addAndSendOOBFailure();
          break;
        case "addOOBToUserSuccess" : 
          this.addOOBToUserSuccess();
          break;
        case "addOOBToUserFailure" : 
          this.addOOBToUserFailure();
          break;
        case "approveDeviceRegistrationSuccess" :
          this.approveDeviceRegistrationSuccess(UIObject.response);
          break;
        case "approveDeviceRegistrationFailure" :
          this.approveDeviceRegistrationFailure(UIObject.response);
          break;
        case "deviceRegistrationPollingSuccess" :
          this.deviceRegistrationPollingSuccess(UIObject.response);
          break;
        case "deviceRegistrationPollingFailure" :
          this.deviceRegistrationPollingFailure(UIObject.response);
          break;  
        case "RegistrationSuccess" :
          this.RegistrationSuccess(UIObject.response);
          break;
        case "approveNotificationSuccess" :
          this.approveNotificationSuccess(UIObject.response);
          break;
        case "approveNotificationFailure" :
          this.approveNotificationFailure(UIObject.response);
          break;
        case "approveStatusPollingSuccess" :
          this.approveStatusPollingSuccess(UIObject.response);
          break;
        case "approveStatusPollingFailure" :
          this.approveStatusPollingFailure(UIObject.response);
          break;
        case "validateOOBSuccess" :
          this.validateOOBSuccess(UIObject.response);
          break;
        case "activationCodeSuccessWithPasswordPolicy":
          this.updatePwdPolicy(UIObject.response);
          break;
        case "validateOOBFailure" :
          this.validateOOBFailure(UIObject.response);
          break;
        case "searchHWTSuccess" :
          this.searchHWTSuccess(UIObject.response);
          break;
        case "searchHWTFailure" :
          this.searchHWTFailure(UIObject.response);
          break;
        case "addHWAuthenticatorSuccess":
          this.addHWAuthenticatorSuccess();
          break;
        case "addHWAuthenticatorFailure":
          this.validateOOBFailure(UIObject.response);
          break
        case "searchHardwareDeviceFailure" :
          this.searchHardwareDeviceFailure(UIObject.response);
          break;
        case "addHardwareDeviceToUserSuccess" :
          this.addHardwareDeviceToUserSuccess(UIObject.response);
          break;
        case "addHardwareDeviceToUserFailure" :
          this.addHardwareDeviceToUserFailure(UIObject.response);
          break;
        default:
          alert("Object state unavailable: "+UIObject.state);
      }
      this.commonEventHandler(this.dismissLoading, "");
    },
    resetUIFields: function() {
      this.view.tbxActivationCode.text = "";
      this.view.tbxPassword1.text = "";
      this.view.tbxPassword2.text = "";
      this.view.lblErrorLogin.text = "";
      this.view.lblErrorPassword.text = "";
      this.view.lblErrorApprove.text = "";
      this.view.lblErrorOTP.text = "";
    },
    btnLogin_onClick: function() {
      if (this.view.tbxUser.text === "") {
        this.view.lblErrorLogin.text = "Please enter UserID";
        return;
      }
      if (this.view.tbxActivationCode.text === "") {
        this.view.lblErrorLogin.text = "Please enter Activation Code";
        return;
      }
      var username = this.view.tbxUser.text;
      var activationCode = this.view.tbxActivationCode.text;
      this.commonEventHandler(this.showLoading, "");
      this.username = username;
      OnboardingPresentationController.validateActivationCode(this.updateOnboardingUI,username, activationCode);
    },
    btnSubmitHW_onClick: function() {      
      if (this.view.tbxDeviceSerial.text === "") {
        this.view.lblErrorHW.setVisibility(true);
        this.view.lblErrorHW.text = "Please enter Device Serial number";
        return;
      }
      this.view.lblErrorHW.text ="";
      var deviceSerial = this.view.tbxDeviceSerial.text;
      this.commonEventHandler(this.showLoading, "");
      this.deviceSerial = deviceSerial;
      OnboardingPresentationController.searchHardwareDevice(this.updateOnboardingUI,deviceSerial);
    },

    btnConfirmHWOTP_onClick : function(){
      var OTP = this.view.tbxHWOTP.text;
      if (this.view.tbxHWOTP.text === "") {
        this.view.lblErrorHWOTP.setVisibility(true);
        this.view.lblErrorHWOTP.text = "Please enter One Time Password";
        return;
      }
      var authType = "AT_EMPOTP";
      this.view.lblErrorHWOTP.text = "";
      this.commonEventHandler(this.showLoading, "");
      OnboardingPresentationController.validateOOB(this.updateOnboardingUI,OTP,authType);	
    },
    btnPwdSubmit_onClick: function() {
      if (this.view.tbxPassword1.text === "") {
        this.view.lblErrorPassword.text = "Please enter the Password";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (this.view.tbxPassword2.text === "") {
        this.view.lblErrorPassword.text = "Please confirm the Password";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (this.view.tbxPassword2.text !== this.view.tbxPassword1.text) {
        this.view.lblErrorPassword.text = "Passwords Do not Match";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      var s = this.view.tbxPassword1.text;
      if (s.length < this.pwdMinLength || s.length > this.pwdMaxLength) {
        this.view.lblErrorPassword.text = "Password Should be minimum 5 and maximum 100 characters";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (s.search(/[a-z]/i) < 0) {
        this.view.lblErrorPassword.text = "Your password must contain at least one letter.";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (s.search(/[0-9]/) < 0) {
        this.view.lblErrorPassword.text = "Your password must contain at least one digit.";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (this.pwdNotSequence === "true" && !this.seqCheck(s)) {
        this.view.lblErrorPassword.text = "Password Should not contain a number or letter sequence";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if(this.pwdNotUserAttribute === "true" && this.checkUsernameInPassword(s)){
        this.view.lblErrorPassword.text = "Password Should contain username";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      if (!this.UniqueCount(s)) {
        this.view.lblErrorPassword.text = "Password Should contain minimum 5 different characters";
        this.view.lblErrorPassword.setVisibility(true);
        return;
      }
      var password = this.view.tbxPassword1.text;
      this.commonEventHandler(this.showLoading, "");
      OnboardingPresentationController.addPasswordandMFAtoUser(this.updateOnboardingUI,password,this._MFA);
    },
    updatePwdPolicy : function(response){
       //alert(JSON.stringify(response));
       this.pwdMinDiffChar = +response.minDiffChars || 5;
       this.pwdMinLength = +response.minLength || 5;
       this.pwdMaxLength = +response.maxLength || 100;
       this.pwdNotSequence = response.notSequence || "true";
       this.pwdNotUserAttribute = response.notUserAttribute || "true";
       this.commonEventHandler(this.passwordPolicy,response);
       this.activationCodeSuccess(response);
    },
    btnConfirmOTP_onClick : function(){
      var OTP = this.view.tbxOTP.text;
      if (this.view.tbxOTP.text === "") {
        this.view.lblErrorOTP.setVisibility(true);
        this.view.lblErrorOTP.text = "Please enter One Time Password";
        return;
      }
      this.view.lblErrorOTP.text = "";
      this.commonEventHandler(this.showLoading, "");
      OnboardingPresentationController.validateOOB(this.updateOnboardingUI,OTP);
    },
    activationCodeSuccess: function(response) {
      this.userId = response.userid;
      //alert(this.userId);
      this.contextSwitch("ConfirmPassword");
    },
    activationCodeFailure: function({ActivationCodeError}) {
      this.resetUIFields();
      this.view.lblErrorLogin.text = ActivationCodeError;
    },
    addAndSendOOBSuccess : function(){
      this.contextSwitch("OTP");
    },
    addAndSendOOBFailure : function(){
      this.contextSwitch("Error");
    },
    approveDeviceRegistrationSuccess : function(response){
      this.view.qrcodegenerator.dataToEncode = response.inviteCodeString;
      this.view.qrcodegenerator.generate();
      this.view.lblUid.text = `<p>Username : ${response.username}<\p>`;
      this.view.lblInvCode.text =`<p>Invite Code : ${response.decodedInvCode}<\p>`;
      this.view.lblRegURL.text = `<p>${response.url}<\p>`;
      this.view.flxQRMain.setVisibility(true);
      this.view.flxManualMain.setVisibility(false);
      this.view.lblActivatemanually.text = "Activate Manually";
      var hyperLink = `hidglobal-approve://activate?name=ActivID%20Self%20Service%20Portal&qrcode=${btoa(response.inviteCodeString)}`;
      var manualText =  `<p> If you are accessing the portal from the device on which you want to activate HID Approve, click this <a href="${hyperLink}"  style="font-size:15px">link</a></p>`; 
      var QRtext = `<p>Scan your QR Code using HID Approve app on your  mobile device</p>`;
      this.view.lblActivatemanually.onTouchEnd = source => {
        //alert(source.text);
        let state = source.text === "Activate Manually" ? "Manual" : "QR";
        source.text = state === "Manual" ? "View QR" : "Activate Manually";
        this.view.lblScanQR.text  = state === "Manual" ? manualText : QRtext;
        this.view.flxQRMain.setVisibility(state === "QR");
        this.view.flxManualMain.setVisibility(state === "Manual");
        this.view.forceLayout();
      };
      this.contextSwitch("DeviceRegistration");
    },
    approveDeviceRegistrationFailure: function(response){
      //to show error message in case of failure of device registration.
      this.contextSwitch("Error");
    },
    approveNotificationSuccess : function(){
      //Can initiate timer if necessary
    },

    approveNotificationFailure : function(){
      this.view.lblErrorApprove.text = "Approve push request declined";
    },
    approveStatusPollingSuccess: function({message}){
      this.contextSwitch("RegistrationSuccess");
    },
    approveStatusPollingFailure: function({message}){
      this.view.lblErrorApprove.text = message;
    },

    deviceRegistrationPollingSuccess: function(response){
      this.contextSwitch("Approve");
      OnboardingPresentationController.initiateApproveNotification(this.updateOnboardingUI);
    },
    deviceRegistrationPollingFailure: function(response){
      //Can update any text field
      kony.print("Device registration polling timed out");
    },

    btnResendApproveNotification: function(){
      this.resetUIFields();
      OnboardingPresentationController.initiateApproveNotification(this.updateOnboardingUI);
    },

    btnPushDone_onClick: function(){
      this.contextSwitch("RegistrationSuccess");
    },
    btnCancelMain_onClick: function(){
      this.resetUIFields();
      this.contextSwitch("Login");
    },

    validateOOBSuccess: function(){
      this.contextSwitch("RegistrationSuccess");
    },
    validateOOBFailure: function(){
      this.view.lblErrorOTP.text = "Failed to validate One Time Password";
      this.view.lblErrorOTP.setVisibility(true);
      this.view.lblErrorHWOTP.text = "Failed to validate One Time Password";
      this.view.lblErrorHWOTP.setVisibility(true);
    },
    addOOBToUserSuccess: function(){
      //A success event can be handled if necessary
    },
    addOOBToUserFailure: function(){
      this.contextSwitch("Error");
    },
    addPasswordandMFAtoUserFailure: function(){
      //this.contextSwitch("Error");
      this.view.lblErrorPassword.text = `Invalid password entered.`
    },
    addHardwareDeviceToUserSuccess: function(){
      this.contextSwitch("HWOTP");
    },
    addHardwareDeviceToUserFailure: function(){
      this.view.lblErrorHW.text = "Failed to Add Hardware token device to user."
      this.view.lblErrorHW.setVisibility(true);
    },
    addHWAuthenticatorSuccess : function(){
      this.contextSwitch("HW");
    },
    searchHardwareDeviceFailure: function(){
      this.view.lblErrorHW.text = "Unable to find Hardware devices";
      this.view.lblErrorHW.setVisibility(true);
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
    contextSwitch: function(context) {
      this.commonEventHandler(this.changeContext,context);
      this.resetUIFields();
      for (let i of contexts) {
        this.view[`flx${i}`].setVisibility(i === context);
      }
      this.view.forceLayout();
    },
    swithcLoginWrapper : function(){
       this.commonEventHandler(this.switchLogin,"");
    },
    getUserId : function(){
       return this.userId;
    },
    getUsername : function(){
      return this.username;
    },
    commonEventHandler(event,intent){
       if(event){
          event(intent);
       }
    },
    resetUI : function(){
       this.contextSwitch("Login");
    },
  };

});