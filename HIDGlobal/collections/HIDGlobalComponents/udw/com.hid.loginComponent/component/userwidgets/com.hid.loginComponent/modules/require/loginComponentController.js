define(['com/hid/loginComponent/AuthenticationPresentationController'], function(AuthenticationPresentationController) {
  var contexts = ["Login","OTP","OTPError","PushDevices", "Approve"];
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUIFields();
      this.view.btnLogin.onClick = this.loginPassword;
      this.view.tbxPassword.onDone = this.loginPassword;
      this.contextSwitch("Login");
      this.username = "";
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
    gblTimer : null,

    setContext: function(context) {
    },

    loginPassword : function(){
      if(this.view.tbxUser.text === ""){
        this.view.lblErrorLogin.text = "Please enter UserID";
        return;
      }
      if(this.view.tbxPassword.text === ""){
        this.view.lblErrorLogin.text = "Please enter Password";
        return;
      }
      this.username = this.view.tbxUser.text;
      this.commonEventHandler(this.showLoading, "");
      AuthenticationPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.onValidatePasswordSuccess, this.onValidatePasswordFailure);    
    },
    onValidatePasswordSuccess : function(response){
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
    },
    onValidatePasswordFailure : function(error){
      this.view.lblErrorLogin.text = "Username or Password is Incorrect";
      this.commonEventHandler(this.dismissLoading, "");
    },
    initiateSecondFactor : function(){
      if(this._MFA === "OTP_SMS" || this._MFA === "OTP_EML"){
        AuthenticationPresentationController.sendOTP(this._MFA, this.username, this.sendOTPSuccess, this.sendOTPFailure);
      } else if (this._MFA === "APPROVE") {
        AuthenticationPresentationController.getApproveDevices(this.username, this.getDeviceSuccess, 
                                                               this.getDeviceFailure);

      }else if (this._MFA === "OTP_HWT") {
        //this.showHWOTPFlx()
        this._MFA = "APPROVE";
        this.sendOTPSuccess("OTP_HWT");
      }
    },

    sendOTPSuccess : function(response){      
      switch(this._MFA){
        case "OTP_SMS":
          this.view.lblWelcome6.text = "HID Out Of Band SMS OTP";
          break;
        case "OTP_EML":
          this.view.lblWelcome6.text = "HID Out of Band Email OTP";
          break;
        case "OTP_HWT" :
          this.view.lblWelcome6.text = "HID Hardware Token OTP";
          break;
        default: 
          this.view.lblWelcome6.text = "HID Secure Code";
      }      
      this.contextSwitch("OTP");
    },

    sendOTPFailure : function(error){
      this.contextSwitch("OTPError");
      switch(this._MFA){
        case "OTP_SMS":
          this.view.lblWelcome7.text = "HID Out Of Band SMS OTP";
          this.view.lblSendOtpError.text = "Failed to send OTP on the registered mobile number.\n Please try again";
          break;
        case "OTP_EML":
          this.view.lblWelcome7.text = "HID Out of Band Email OTP";
          this.view.lblSendOtpError.text = "Failed to send OTP on the registered email address.\n Please try again";
          break;
        default: 
          this.view.lblWelcome7.text = "HID Secure Code";          
      }     
    },  

    validateOTP : function(){
      this.commonEventHandler(this.showLoading, "");
      this.view.lblErrorOTP.text = "";
      AuthenticationPresentationController.validateOTP(this._MFA, this.view.tbxOTP.text, this.mfa_key, this.AuthSuccess, 
                                                       this.onValidateOTPFailure);
    },

    AuthSuccess : function(response){
      if(this._MFA === "APPROVE"){                
        clearInterval(this.gblTimer);        
      }
      this.mfa_key = "";
      this.onSuccessCallback(response);
      this.commonEventHandler(this.dismissLoading, "");
      //this.contextSwitch("Login");
    },

    onValidateOTPFailure : function(error) {
      if(!this.validateFailureCallbackScenario(error)){
        this.view.lblErrorOTP.text = "Invalid OTP entered, please enter valid OTP";
        this.commonEventHandler(this.dismissLoading, "");
      }
    },

    validateFailureCallbackScenario : function(error){
      let errorMessage = "";
      if(error.message.includes("Previous Identity Token expired in backend.")){        
        errorMessage = "Login timed out, please try again";        
      }
      if(error.details.errmsg.includes("Failed to get user identity attributes")){
        errorMessage = "Error occurred while login, please contact your administrator";
      }
      if(errorMessage !== ""){
        this.contextSwitch("Login");
        this.view.lblErrorLogin.text = errorMessage;
        if(this._MFA === "APPROVE"){                
          clearInterval(this.gblTimer);        
        }
        this.onFailureCallback(error);
        this.commonEventHandler(this.dismissLoading, "");
        return true;
      }
      return false;
    },

    cancelOnClick : function(){
      this.mfa_key = "";
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);		  
        AuthenticationPresentationController.cancelApprovePolling();
      }
      this.contextSwitch("Login");
    },

    getDeviceSuccess : function(response) {
      if(response.length === 0){
        this.getDeviceFailure("");
      } else if(response.length > 1){
        this.contextSwitch("PushDevices");
        let deviceData = response.map((device) => ({
          "deviceName" : device.friendlyName,
          "deviceId" : device.deviceId}));

        let widetDataMap = {
          "lblDeviceName" : "deviceName",
          "lblDeviceId" : "deviceId"                        
        };
        this.view.segmentPushDevices.widgetDataMap = widetDataMap;        
        //let finalData = [ {"lblEnableDiasbleHeader" : "Edit","lblTotalFailureHeader" : "Total Failures","lblAuthHeader" : "Authenticator","lblStatusHeader":"Status","lblTotalSuccessHeader":"Total Success","template":"flxAuthHeader"}];
        //inalData.push(authData);
        this.view.segmentPushDevices.data = deviceData;
        this.commonEventHandler(this.dismissLoading, "");

      } else {
        this.deviceId = "";
        AuthenticationPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess, 
                                                             this.initiateApproveFailure);
      }
    },

    initiateApprove : function(rowNumber){
      this.commonEventHandler(this.showLoading, "");
      let totalData = this.view.segmentPushDevices.data.slice();
      let data = totalData[rowNumber];
      this.deviceId = data.deviceId;
      AuthenticationPresentationController.initiateApprove(this.username, this.deviceId, this.initiateApproveSuccess, 
                                                           this.initiateApproveFailure);
    },

    getDeviceFailure : function(response) {
      this.approveView(false, "Approve");
      this.view.lblApproveNot.text = "No push device is registered, please complete enrollment process.";
      this.commonEventHandler(this.dismissLoading, "");
    },

    initiateApproveSuccess : function(response){      
      this.approveView(true, "Approve");
      this.commonEventHandler(this.dismissLoading, "");
      this.view.lblApproveNot.text = "We've sent a notification to your device. Approve the notification to continue.";
      AuthenticationPresentationController.pollForApprove(response, this.mfa_key, this.AuthSuccess,
                                                          this.onApproveFailure);
    },  

    initiateApproveFailure : function(respose){      
      this.approveView(false, "Approve");
      this.view.lblApproveNot.text = "Failed to send push notification on the registered device. Please try to resend or try login using Approve secure code.";
      this.commonEventHandler(this.dismissLoading, "");
    },

    onApproveFailure : function(response){
      let status = false;
      if(response !== "deny"){
        status = this.validateFailureCallbackScenario(response);
      }
      if(!status){
        this.approveView(false,"Approve");
        let errorText = "";
        if(response === "deny"){
          errorText = "Approve has been declined, please try again";
        }else if(response.message === "Approve poll Time Expired"){
          errorText = "Approve timeout please try resend or try login using Approve secure code";
        } else {
          this.contextSwitch("Login");
          this.view.lblErrorLogin.text = "Error occurred while Login, please try again";
          this.onFailureCallback(response);
        }
        if(errorText !== ""){ 
          this.view.lblErrorApprove.text = errorText;
        }
        this.commonEventHandler(this.dismissLoading, "");
      }
    },

    logoutOnClick : function(){
      AuthenticationPresentationController.logout(this.onLogoutSuccess.bind(this), this.onLogoutFailure.bind(this));
    },

    onLogoutSuccess : function(response){
      this.mfa_key = "";
      return;
      //this.contextSwitch("Login");
    },

    onLogoutFailure : function(error){
      this.view.lblAuthStatus.text = "Failed to logout";
      return;
      //       this.view.lblAuthStatus.skin = "sknHIDError";
      //       this.view.flxAuthSuccess.forceLayout();
    },   

    approveView:function(visible,context){
      if(visible){
        this.timerNot();
      }else{
        if(this.gblTimer){          
          clearInterval(this.gblTimer);
        }
      }
      let skin = visible ? "sknHIDNotification"  : "sknHIDError";
      this.view.lblApproveNot.skin = skin;       
      this.contextSwitch(context);        
    },

    timerNot:function(){
      var a = 120;
      var self = this;
      self.view.lblTimerNot.text = "";
      var timer =null;
      this.gblTimer = timer = setInterval(timerFun,1000);
      function timerFun(){
        if(a === 0){
          //alert("timer canceled");
          clearInterval(timer);
          AuthenticationPresentationController.cancelApprovePolling();
          self.view.lblErrorApprove.text = `Approve timeout, please try resend or try login using Approve secure code`;
          self.view.flxApprove.forceLayout();
        }
        let min = Math.floor(a/60);
        let sec = a%60;
        var text = sec < 10 ? `0${min}:0${sec}`:`0${min}:${sec}`;
        self.view.lblTimerNot.text = text;
        self.view.flxTimer.forceLayout();
        a--;
      }
    },

    trySecureCodeOnClick : function(){
      this.view.lblWelcome6.text = "HID Approve Secure Code";      
      AuthenticationPresentationController.cancelApprovePolling();
      this.contextSwitch("OTP");
    },

    resendPushTouchEnd : function(){
      if(this.gblTimer !== null){
        this.view.lblTimerNot.text = "";
        clearInterval(this.gblTimer);
      }
      AuthenticationPresentationController.cancelApprovePolling();
      AuthenticationPresentationController.initiateApprove(this.username, this.deviceId, this.initiateApproveSuccess, 
                                                           this.initiateApproveFailure);
    },

    contextSwitch: function(context) {
      this.commonEventHandler(this.changeContext,context+"Auth");
      this.resetUIFields();
      for (let i of contexts) {
        this.view[`flx${i}`].setVisibility(i === context);
      }
      this.view.forceLayout();
    },

    resetUIFields : function(){
      this.view.tbxUser.text = "";
      this.view.tbxPassword.text = "";
      this.view.lblErrorLogin.text = "";
      this.view.tbxOTP.text = "";
      this.view.lblErrorOTP.text = "";
      this.view.lblSendOtpError.text = "";
      this.view.lblApproveNot.text = "";
      this.view.lblErrorApprove.text = "";
      this.view.lblTimerNot.text = "";
    },
    resetUI : function(){
      //alert("Tis called");
      this.contextSwitch("Login");
    },
    getUserName : function(){
      return this.username;
    },
    commonEventHandler(event,intent){
      if(event){
        event(intent);
      }
    }   
  };
});