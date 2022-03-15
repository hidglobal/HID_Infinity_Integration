define(['com/hid/loginComponent/AuthenticationPresentationController'], function(AuthenticationPresentationController) {
  var contexts = ["Login","OTP","OTPError","PushDevices", "Approve"];
  var ip_url = `https://myexternalip.com/raw`;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUIFields();
      this.view.btnLogin.onClick = this.loginPassword;
      this.view.tbxPassword.onDone = this.loginPassword;
      this.contextSwitch("Login");
      this.TM_Cookie_Sid = "";
      this.TM_Cookie_Tag = "";
      this.tm_sid = "";
      this.tm_tag = "";
      this._adaptiveAuth ="";
    },
    app_session_id : "",
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
      //Check for RMS enabled or not.
      defineGetter(this, "isRMSEnabled", function() {
        kony.print(this._isRMSEnabled);
        return this._isRMSEnabled;
      });
      defineSetter(this, "isRMSEnabled", function(val){
        if(!(val) || val == undefined){
          this._isRMSEnabled = false;
        }
        else this._isRMSEnabled = val;
      });
      //Check for RMS Read Only or not.
      defineGetter(this, "isRMSReadOnly", function() {
        kony.print('isRMSReadOnly:'+this._isRMSReadOnly);
        return this._isRMSReadOnly;
      });
      defineSetter(this, "isRMSReadOnly", function(val){
        if(!(val) || val == undefined){
          this._isRMSReadOnly = false;
        }
        else this._isRMSEnabled = val;
      });
      //Check for RMS defined Cookies
      defineGetter(this, "tmCookieSid", function() {
        return this.TM_Cookie_Sid;
      }); defineSetter(this, "tmCookieSid", function(val){
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

      defineGetter(this, "adaptiveAuth", function() {
        return this._adaptiveAuth;
      });
      defineSetter(this, "adaptiveAuth", function(val) {
        if(!(val)|| val == undefined){  
          this._adaptiveAuth=null;
        }
        this._adaptiveAuth = val;
      });
    },
    username : "",
    gblTimer : null, 
    deviceTag : "",
    isKnownDevice : false,
    client_ip : "",
    newrequest : "",
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
      if(this._isRMSEnabled == true){
        this.loginPasswordwithRMS();
      } else {
        this.loginPasswordWithoutRMS();
      }
    },
    loginPasswordwithRMS : function() {
      let decodeCookie = document.cookie.split(";");
      for(var i=0; i<decodeCookie.length; i++) {
        cookiename = decodeCookie[i].split('=')[0].replace(/\s/g, "");
        if (cookiename === this.TM_Cookie_Sid){
          this.tm_sid = decodeCookie[i].split('=')[1];
        }
        if (cookiename === this.TM_Cookie_Tag){
          this.tm_tag = decodeCookie[i].split('=')[1];
        }
      }
      this.deviceTag = localStorage.getItem(`HID_deviceTag_${this.username}`); 
      if(this.deviceTag === null){
        this.isKnownDevice = false;
        this.deviceTag = this.tm_tag;
      }
      else{ 
        this.isKnownDevice = this.deviceTag==this.tm_tag;
      } 
      kony.print("RMS => isKnownDevice:"+this.isKnownDevice);
      //this.GetMyIpFunction();
      var self = this;
      if(this.client_ip.trim() != ""){
        this.rmsLoginApiCall();
      }else{
        const url = "https://api.ipify.org/?format=json"
        fetch(url)
          .then(response => response.json())
          .then(data =>{ 
          self.client_ip = data.ip;
          self.rmsLoginApiCall();
        });
      }
    },     
    GetMyIpFunction: function(){
      try{
        var url = ip_url;
        var request = new kony.net.HttpRequest();
        newrequest = request;
        request.onReadyStateChange = this.CallBackFunction;
        request.open(constants.HTTP_METHOD_GET, url, true);
        request.send();
      }catch(ex){
        kony.print(ex.message);
      }
    },    
    CallBackFunction: function(){
      if(this.client_ip.trim() !=""){
        return;
      }
      if(newrequest.readyState == constants.HTTP_READY_STATE_DONE){
        var resString = newrequest.response;
        this.client_ip = resString;
        this.rmsLoginApiCall();
      }
    },
    rmsLoginApiCall : function(){
      let randomValue = Math.floor(Math.random()*10000000);
      this.app_session_id = String(randomValue) ;

      const rmsLoad = {
        "tm_sid" : this.tm_sid,
        "tm_tag" : this.tm_tag,
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id
      };
      this.commonEventHandler(this.showLoading, "");
      AuthenticationPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.onValidatePasswordRMSSuccess, this.onValidatePasswordRMSFailure,rmsLoad);
    },
    onValidatePasswordRMSSuccess : function(response){
      alert(JSON.stringify(response.mfa_meta.rms));
      this.mfa_key = response.mfa_meta.auth_id;
      var noStepup = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp == "false";
      var stepUp = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp == "true";
      this.currentThreat = +response.mfa_meta.rms.currentThreat || 10;
      if(noStepup && this.isKnownDevice){
        //If isRMSReadOnly then donot perform stepdown
        kony.print("RMS => isRMSReadOnly:"+this._isRMSReadOnly);
        if(this._isRMSReadOnly == false){
          this.updateRMSServiceEvent("STEP_DOWN");
          return;
        }
      }
      this.factorType = response.mfa_meta.rms.hasOwnProperty("factorType") ;
      this.commonEventHandler(this.dismissLoading, "");
      var adaptiveMFA = this._MFA;
      if(this._adaptiveAuth){     
        if(stepUp && this._adaptiveAuth.hasOwnProperty("default")){
          adaptiveMFA = this._adaptiveAuth.default;
        }
        var isValidCustomString = !this._adaptiveAuth.hasOwnProperty("customAdaptiveAuth") ||this._adaptiveAuth.customAdaptiveAuth.filter(v=> !v.hasOwnProperty("authType") || !v.hasOwnProperty("lowerLimit") || !v.hasOwnProperty("upperLimit")).length !=0;
        if(isValidCustomString){
          throw {
            "type": "CUSTOM",
            "message": "adaptiveAuth object is not valid"
          };
        }
        var ct = this.currentThreat
        var filteredArray = this._adaptiveAuth.customAdaptiveAuth.filter(v=> ct >= v.lowerLimit && ct < v.upperLimit);
        if(filteredArray.length>0){
          adaptiveMFA = filteredArray[0].authType;
        } 
      }
      this._MFA = adaptiveMFA;
      this.initiateSecondFactor();
      this.client_ip="";
    },
    onValidatePasswordRMSFailure : function(error){
      kony.print("onValidatePasswordRMSFailure error:"+JSON.stringify(error));
      if(error.details.message.includes("USER-BLOCK") && error.details.message.includes(-3)){
        this.view.lblErrorLogin.text = "User is blocked for Login";
      } else {
        this.view.lblErrorLogin.text = "Username or Password is Invalid";
      }
      this.commonEventHandler(this.dismissLoading, "");
      this.client_ip="";
    },
    updateRMSServiceEvent : function(rmsevent){
      if(rmsevent === "STEP_DOWN"){
        AuthenticationPresentationController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onStepDownSuccessCB, this.onStepDownFailureCB );
      } else if((rmsevent === "APPROVE_DENY") || (rmsevent === "APPROVE_TIMEOUT")){
        AuthenticationPresentationController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onApproveRMSEventSuccessCB, this.onApproveRMSEventFailureCB);
      }
    },
    onApproveRMSEventSuccessCB: function(response){
      //This is a non occuring condition
      kony.print("updateRMSServiceEvent APPROVE_DENY/TIMEOUT : Nothing");
    },
    onApproveRMSEventFailureCB: function(response){
      //This is a non occuring condition
      kony.print("updateRMSServiceEvent APPROVE_DENY/TIMEOUT RMS: Success");
    },
    onStepDownSuccessCB : function(response){
      this.mfa_key = "";
      if(!this.isKnownDevice){
        this.confirmationAlert(this.deviceTag);
      }
      this.client_ip = "";
      this.onSuccessCallback(response);
      this.commonEventHandler(this.dismissLoading, "");
    },
    onStepDownFailureCB : function(error){
      this.view.lblErrorLogin.text = "Something went wrong Please after sometime " + error;
    },

    confirmationAlert: function(tag){ 
      var basicConf = {
        message: "Do you want to mark this browser as trusted device",
        alertType: constants.ALERT_TYPE_CONFIRMATION,
        alertTitle: "Confirmation for Trusted Device",
        alertHandler : isTrustedDevice.bind(this)
      };
      var pspConfig = {
        "contentAlignment": constants.ALERT_CONTENT_ALIGN_CENTER
      };
      function isTrustedDevice(res){
        if(res == true){
          localStorage.setItem(`HID_deviceTag_${this.username}`,tag);         
        }    
      }
      kony.ui.Alert(basicConf, pspConfig);
    },

    loginPasswordWithoutRMS : function(){
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
                                                               this.getDeviceFailure); }else if (this._MFA === "OTP_HWT") {
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
      if((this._isRMSEnabled == true) && !this.isKnownDevice){
        this.confirmationAlert(this.deviceTag);
      }
      this.client_ip = "";
      this.onSuccessCallback(response);
      this.commonEventHandler(this.dismissLoading, "");
      //this.contextSwitch("Login");
    }, 
    onValidateOTPFailure : function(error) {
      if(!this.validateFailureCallbackScenario(error)){
        this.view.lblErrorOTP.text = "Invalid OTP entered, please enter valid OTP";
      }
      this.commonEventHandler(this.dismissLoading, "");
    }, 
    validateFailureCallbackScenario : function(error){
      let errorMessage = "";
      if(error.hasOwnProperty("message") && error.message.includes("Previous Identity Token expired in backend.")){
        errorMessage = "Login timed out, please try again";
      }
      if(error.hasOwnProperty("details") && error.details.errmsg.includes("Failed to get user identity attributes")){
        errorMessage = "Error occurred while login, please contact your administrator";
      }
      if(errorMessage !== ""){
        this.contextSwitch("Login");
        this.view.lblErrorLogin.text = errorMessage;
        if(this._MFA === "APPROVE"){
          clearInterval(this.gblTimer);
        }
        this.commonEventHandler(this.dismissLoading, "");
        this.onFailureCallback(errorMessage);
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
          "deviceId" : device.deviceId})); let widetDataMap = {
          "lblDeviceName" : "deviceName",
          "lblDeviceId" : "deviceId"
        };
        this.view.segmentPushDevices.widgetDataMap = widetDataMap;
        //let finalData = [ {"lblEnableDiasbleHeader" : "Edit","lblTotalFailureHeader" : "Total Failures","lblAuthHeader" : "Authenticator","lblStatusHeader":"Status","lblTotalSuccessHeader":"Total Success","template":"flxAuthHeader"}];
        //inalData.push(authData);
        this.view.segmentPushDevices.data = deviceData;
        this.commonEventHandler(this.dismissLoading, ""); } else {
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
          //Approve Failure API call to RMS 
          if(this._isRMSEnabled == true){
            this.updateRMSServiceEvent("APPROVE_DENY");
          }
        }else if(response.message === "Approve poll Time Expired"){
          errorText = "Approve timeout please try resend or try login using Approve secure code";
          //Approve Timeout call to RMS
          if(this._isRMSEnabled == true){
            this.updateRMSServiceEvent("APPROVE_TIMEOUT");
          }
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

    logoutOnClick : function(username,sessionId=""){
      this.username = username;
      this.app_session_id = sessionId;
      AuthenticationPresentationController.logout(this.onLogoutSuccess.bind(this), this.onLogoutFailure.bind(this));
    }, 
    onLogoutSuccess : function(response){
      if(this._isRMSEnabled == true){
        this.rmsSessionLogout();
      }
      this.mfa_key = "";
      this.client_ip ="";
      return;
      //this.contextSwitch("Login");
    }, 
    onLogoutFailure : function(error){
      this.view.lblAuthStatus.text = "Failed to logout";
      return;
      // this.view.lblAuthStatus.skin = "sknHIDError";
      // this.view.flxAuthSuccess.forceLayout();
    }, 
    rmsSessionLogout : function(){
      kony.print("In RMS Session Logout")
      AuthenticationPresentationController.rmsSessionLogout(this.username,this.app_session_id,this.onRmsSessionLogoutSuccess,this.onRmsSessionLogoutFailure);
    },
    onRmsSessionLogoutSuccess: function(response){
      kony.print("onRmsSessionLogoutSuccess: Success");
    },
    onRmsSessionLogoutFailure: function(response){
      kony.print("onRmsSessionLogoutFailure: Failure:"+JSON.stringify(response));
    },
    approveView:function(visible,context){
      if(visible){
        this.timerNot();
      }else{
        if(this.gblTimer){
          clearInterval(this.gblTimer);
        }
      }
      let skin = visible ? "sknHIDNotification" : "sknHIDError";
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
      this.contextSwitch("Login");
    },
    getUserName : function(){
      return this.username;
    },
    getRmsSessionId : function(){
      return this.app_session_id;
    },
    commonEventHandler(event,intent){
      if(event){
        event(intent);
      }
    }
  };
});