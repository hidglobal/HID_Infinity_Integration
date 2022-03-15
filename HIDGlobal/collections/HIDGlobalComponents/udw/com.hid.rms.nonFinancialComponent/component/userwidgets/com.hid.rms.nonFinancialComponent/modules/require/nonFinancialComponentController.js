define(['com/hid/rms/nonFinancialComponent/NonFinancialPresentationController'],function(NonFinancialPresentationController) {
  var contexts = ["Login","OTP","OTPError","PushDevices", "Approve"];
  var ip_url = `https://myexternalip.com/raw`;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUIFields();
      this.view.btnSubmit.onClick = this.loginPassword;
      this.view.tbxPassword.onDone = this.loginPassword;
      this.TM_Cookie_Sid = "";
      this.TM_Cookie_Tag = "";
      this.tm_sid = "";
      this.tm_tag = "";
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, 'thresholdScore', () => {
        return this._thresholdScore;
      });
      defineSetter(this, 'thresholdScore', value => {

        this._thresholdScore = value;
      });
      defineGetter(this, 'MFA', () => {
        return this._MFA;
      });
      defineSetter(this, 'MFA', value => {
        if(!["OTP_SMS","OTP_EML","APPROVE","OTP_HWT","STD_PWD"].some(v=>v===value)){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid"
          };
        }
        this._MFA = value;
      });
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
    },
    isRMSEnabled: false,
    gblTimer : null,
    username:"",
    client_ip : "",
    actionType: "",
    newrequest : "",
	app_session_id : "",
    analyzeAction: function(username, actionType,sessionId){
      this.username = username;
      this.actionType = actionType;
      this.app_session_id = sessionId;
      this.assignValue();
      this.commonEventHandler(this.showLoading, "");
    },
    assignValue : function(){
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
      if(this.client_ip.trim() != ""){
        const rmsLoad = {
          "tm_sid" : this.tm_sid,
          "tm_tag" : this.tm_tag,
          "client_ip" : this.client_ip,
          "app_session_id" : this.app_session_id,
        };
        NonFinancialPresentationController.rmsActionCreate(this.username,this.actionType,this.rmsActionSucess,this.rmsActionFailure,rmsLoad);
      }else{
        var self = this;
        if(this.client_ip.trim() != ""){
          this.rmsLoginApiCall();
        }else{
          const url = "https://api.ipify.org/?format=json"
          fetch(url)
            .then(response => response.json())
            .then(data =>{ 
            self.client_ip = data.ip;
            const rmsLoad = {
              "tm_session_sid" : this.tm_sid,
              "tm_device_tag" : this.tm_tag,
              "client_ip" : this.client_ip,
            };
            NonFinancialPresentationController.rmsActionCreate(this.username,this.actionType,this.rmsActionSucess,this.rmsActionFailure,rmsLoad);
          });
        }
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
        const rmsLoad = {
          "tm_session_sid" : this.tm_sid,
          "tm_device_tag" : this.tm_tag,
          "client_ip" : this.client_ip,
        };
        NonFinancialPresentationController.rmsActionCreate(this.username,this.actionType,this.rmsActionSucess,this.rmsActionFailure,rmsLoad);
      }
    },
    rmsActionSucess : function(response){
      alert(JSON.stringify(response));
      var score = response.currentThreat;
      var tagsResp = response.tags || "[]";
      var tags = JSON.parse(tagsResp);
      if(tags && tags.some(v=>v==="USER-BLOCK")){
         this.commonEventHandler(this.dismissLoading, "");
         this.mandatoryEventHandler("analyzeActionFailure", this.analyzeActionFailure, ["User Blocked"]);
         return;
      }
      if(score>=this._thresholdScore){
        this.stepUpAuthentication(this.username, this.actionType);
      } else {
        this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, ["Score < thresholdScore"]);
      }
    },
    rmsActionFailure : function(error){
      this.commonEventHandler(this.stepUpRequired, "true");
      this.stepUpAuthentication(this.username, this.actionType)
    },
    updateActionInRMS : function(){
      NonFinancialPresentationController.rmsActionComplete(true,this.SCB_updateActionInRMS,this.FCB_updateActionInRMS);
    },
    SCB_updateActionInRMS : function(response){
      this.commonEventHandler(this.updateActionInRMSSuccess, "success");
    },
    FCB_updateActionInRMS : function(error){
      this.commonEventHandler(this.updateActionInRMSFailure, "failed");
    },
    stepUpAuthentication : function(username, actionType){
      this.username = username;
      if(this._MFA == "STD_PWD"){
        this.view.tbxUser.text = username;
        this.commonEventHandler(this.stepUpRequired, "true");
        this.contextSwitch("Login");
        return;
      }
      this.initiateSecondFactor();
    },  
    loginPassword : function(){
      if(this.view.tbxPassword.text === ""){
        this.view.lblErrorLogin.text = "Please enter Password";
        return;
      }
//       this.username = this.view.tbxUser.text;
      this.loginPasswordWithoutRMS();
    },

    loginPasswordWithoutRMS : function(){
      this.commonEventHandler(this.showLoading, "");
      NonFinancialPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.onValidatePasswordSuccess, this.onValidatePasswordFailure);
    },
    onValidatePasswordSuccess : function(response){
      //NonFinancialPresentationController.rmsActionSign(this.username,this._MFA,this.rmsActionSignSuccess, this.rmsActionSignFailure);
      this.AuthSuccess(response);
     // this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
    },
    onValidatePasswordFailure : function(error){
      this.view.lblErrorLogin.text = "Password is Incorrect";
      this.commonEventHandler(this.dismissLoading, "");
    },

    initiateSecondFactor : function(){
      if(this._MFA === "OTP_SMS" || this._MFA === "OTP_EML"){
        NonFinancialPresentationController.sendOTP(this._MFA, this.username, this.sendOTPSuccess, this.sendOTPFailure);
      } else if (this._MFA === "APPROVE") {
         this.deviceId = "";
          NonFinancialPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                             this.initiateApproveFailure);
        //this.getDeviceFailure("");
        //NonFinancialPresentationController.getApproveDevices(this.username, this.getDeviceSuccess,
                                                             //this.getDeviceFailure); 
      }else if (this._MFA === "OTP_HWT") {
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
      this.commonEventHandler(this.stepUpRequired, "true");
    }, 
    sendOTPFailure : function(error){
      this.contextSwitch("OTPError");
      this.commonEventHandler(this.stepUpRequired, "true");
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
      NonFinancialPresentationController.validateOTP(this.username,this._MFA, this.view.tbxOTP.text, this.mfa_key, this.AuthSuccess,
                                                     this.onValidateOTPFailure);
    }, 
    cancelOnClick : function(){
      this.mfa_key = "";
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      NonFinancialPresentationController.rmsActionComplete(false,this.SCB_updateActionInRMS,this.FCB_updateActionInRMS);
      this.mandatoryEventHandler("actionCancel", this.analyzeActionFailure, ["Action cancelled"]);
    },

    AuthSuccess : function(response){
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      this.mfa_key = "";
//       if(this._isRMSEnabled && !this.isKnownDevice){
//         this.confirmationAlert(this.deviceTag);
//       }
//       // this.onSuccessCallback(response);
      NonFinancialPresentationController.rmsActionSign(this.username,this._MFA,this.rmsActionSignSuccess, this.rmsActionSignFailure);
      //this.contextSwitch("Login");
    }, 
    
    rmsActionSignSuccess : function(){
      this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
      this.commonEventHandler(this.dismissLoading, "");
    },
    
    rmsActionSignFailure : function(error){
      this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
      this.commonEventHandler(this.dismissLoading, "");
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
    getDeviceSuccess : function(response) {
      if(response.length === 0){
        this.getDeviceFailure("");
      } else if(response.length > 1){
        this.contextSwitch("PushDevices");
        this.commonEventHandler(this.stepUpRequired, "true");
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
        this.commonEventHandler(this.dismissLoading, ""); } 
      else {
          this.deviceId = "";
          NonFinancialPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                             this.initiateApproveFailure);
        }
    }, 
    getDeviceFailure : function(response) {
      this.approveView(false, "Approve");
      this.view.lblApproveNot.text = "No push device is registered, please complete enrollment process.";
      this.commonEventHandler(this.dismissLoading, "");
    },
    initiateApproveSuccess : function(response){
      this.approveView(true, "Approve");
      this.commonEventHandler(this.dismissLoading, "");
      this.commonEventHandler(this.stepUpRequired, "true");
      this.view.lblApproveNot.text = "We've sent a notification to your device. Approve the notification to continue.";
      NonFinancialPresentationController.pollForApprove(this.username,response, this.mfa_key, this.AuthSuccess,
                                                        this.onApproveFailure);
    }, 
    initiateApproveFailure : function(respose){
      this.approveView(false, "Approve");
      this.commonEventHandler(this.stepUpRequired, "true");
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
          NonFinancialPresentationController.rmsActionComplete(false,this.SCB_updateActionInRMS,this.FCB_updateActionInRMS);
          this.mandatoryEventHandler("analyzeActionFailure", this.analyzeActionFailure, ["Action Denied"]);
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
          NonFinancialPresentationController.cancelApprovePolling();
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
      NonFinancialPresentationController.cancelApprovePolling();
      this.contextSwitch("OTP");
    }, 
    resendPushTouchEnd : function(){
      if(this.gblTimer !== null){
        this.view.lblTimerNot.text = "";
        clearInterval(this.gblTimer);
      }
      NonFinancialPresentationController.cancelApprovePolling();
      NonFinancialPresentationController.initiateApprove(this.username, this.deviceId, this.initiateApproveSuccess,
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
    commonEventHandler(event,intent){
      if(event){
        event.call(this,intent);
      }
    },
    mandatoryEventHandler(eventName,event, intent){
      if(event){
        event.apply(this,intent);
      }else{
        const exception = {
          type: "CUSTOM",
          message: `Mandatory Callback ${eventName} is not Configured`
        };
        throw exception;
      }
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

  };

});

