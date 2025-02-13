define(['com/hid/rms/nonFinancialComponent/NonFinancialPresentationController'],function(NonFinancialPresentationController) {
  var contexts = ["Login","OTP","OTPError","PushDevices", "Approve"];
  var ip_url = `https://myexternalip.com/raw`;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUIFields();
      this.getClientAppProperties();
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
      
      /* Second Factor property*/
      defineGetter(this, 'SecondFactor', () => {
        return this._SecondFactor;
      });
      defineSetter(this, 'SecondFactor', value => {
        if(!["OTP_SMS","OTP_EML","APPROVE","OTP_HWT","NO_MFA"].some(v=>v===value)){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid"
          };
        }
        this._SecondFactor = value;
      });
    },
    isRMSEnabled: false,
    gblTimer : null,
    username:"",
    client_ip : "",
    actionType: "",
    newrequest : "",
	app_session_id : "",
    correlationId: "",
    analyzeAction: function(username, actionType,sessionId, isRMSEnabled,correlationId){
      this.username = username;
      this.actionType = actionType;
      this.app_session_id = sessionId;
      this.isRMSEnabled = isRMSEnabled;
      this.correlationId = correlationId;
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
   //   if(this.client_ip.trim() != ""){
        const rmsLoad = {
          "tm_sid" : this.tm_sid,
          "tm_tag" : this.tm_tag,
          "client_ip" : this.client_ip,
          "app_session_id" : this.app_session_id,
        };
        NonFinancialPresentationController.rmsActionCreate(this.username,this.actionType,this.rmsActionSucess,this.rmsActionFailure,rmsLoad);
     // }else{
     //    this.GetMyIpFunction();
     // }
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
      //V10 changes for delete device - Calling NonFinancialComponent MFA"
      
   /*   if (this.actionType === "Delete_Device"){
        var scores = response.currentThreat;
        var tagsResp = (response.tags && response.tags[0] && response.tags[0] !== null) ? response.tags[0] : "STEP-UP";
//         var tagsRes = response.tags || "[]";
//         var tag = JSON.parse(tagsRes);
         var respData = {};
//         if(tag && tag.some(v=>v==="USER-BLOCK")){
//            respData = {status: "USER-BLOCK"};
//            }
         if (scores>=this._thresholdScore){
           respData = {status: "STEP-UP"};
         }
         else{
           respData = {status: "STEP-DOWN"};
         }
        this.mandatoryEventHandler("rmsDeleteStatus", this.rmsDeleteStatus, [respData]);
      }
      else{*/
        var score = response.currentThreat;
        var tagsResp = (response.tags && response.tags[0] && response.tags[0] !== null) ? response.tags[0] : "STEP-UP";
       /*
       V9 Changes
       var tags = JSON.parse(tagsResp);
        if(tags && tags.some(v=>v==="USER-BLOCK")){
           this.commonEventHandler(this.dismissLoading, "");
           this.mandatoryEventHandler("analyzeActionFailure", this.analyzeActionFailure, ["User Blocked"]);
           return;
        }
        */
        if(score >= this._thresholdScore){
          this.stepUpAuthentication(this.username, this.actionType,this.correlationId);
        } else {
          this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, ["Score < thresholdScore"]);
        }
   //   }
    },
    rmsActionFailure : function(error){
      //Karthiga: V10 changes for Delete device
//       if (this.actionType === "Delete_Device"){
//         this.mandatoryEventHandler("rmsDeleteStatus", this.rmsDeleteStatus, [{status: "STEP-UP"}]);
// 		}
//       else{
// 		this.commonEventHandler(this.stepUpRequired, "true");
// 		this.stepUpAuthentication(this.username, this.actionType);
// 		}
       this.mandatoryEventHandler("analyzeActionFailure", this.analyzeActionFailure, ["Failed to create RMS action."]);
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
    stepUpAuthentication : function(username, actionType,correlationId){
      this.correlationId = correlationId;
      this.username = username;
      this.actionType = actionType;
      if(this.actionType && this.actionType === "Delete_Device"){
        this.commonEventHandler(this.stepUpRequired, "true");
        NonFinancialPresentationController.getApproveDevices(this.username,  this.getDeviceSuccess, this.getDeviceFailure); 
        return;
      }
      if(this._MFA == "STD_PWD"){
        this.view.tbxUser.text = username;
        this.commonEventHandler(this.stepUpRequired, "true");
        this.contextSwitch("Login");
        return;
      } else if(this._MFA == "APPROVE"){
		  this.commonEventHandler(this.stepUpRequired, "true");
		  NonFinancialPresentationController.getApproveDevices(this.username,  this.getDeviceSuccess, this.getDeviceFailure); 
		//   this.contextSwitch("PushDevices");
		   return;
		   }
		this.resetUIFields();
      this.initiateSecondFactor();
    },  
    loginPassword : function(){
      if(this.view.tbxPassword.text === ""){
        this.view.lblErrorLogin.text = "Please enter Password";
        return;
      }
      if(this.actionType && this.actionType !== null && this.actionType === "Change_Password"){
        NonFinancialPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.validatePasswordSuccessforCP, this.validatePasswordFailureForCP,this.correlationId);        
      } else{
//       this.username = this.view.tbxUser.text;
      this.loginPasswordWithoutRMS();
      }
    },

    loginPasswordWithoutRMS : function(){
      this.commonEventHandler(this.showLoading, "");
      NonFinancialPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.onValidatePasswordSuccess, this.onValidatePasswordFailure,this.correlationId);
    },
    onValidatePasswordSuccess : function(response){
      this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
    },
    onValidatePasswordFailure : function(error){
      this.view.lblErrorLogin.text = "Password is Incorrect";
      this.commonEventHandler(this.dismissLoading, "");
    },

    initiateSecondFactor : function(){
      if(this._MFA === "OTP_SMS" || this._MFA === "OTP_EML"){
        NonFinancialPresentationController.sendOTP(this._MFA, this.username, this.sendOTPSuccess, this.sendOTPFailure,this.correlationId);
      } else if (this._MFA === "APPROVE") {
         this.deviceId = "";
          NonFinancialPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                             this.initiateApproveFailure,this.correlationId);
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
      if(this._SecondFactor === "OTP_SMS" || this._SecondFactor === "OTP_EML"){
        let authType = (this._SecondFactor === "OTP_SMS") ? "AT_OOBSMS":"AT_OOBEML";
        var inputPayload = {
          "username": this.username,
          "password": this.view.tbxOTP.text.trim(),
          "authType": authType,
          "correaltionId": this.correlationId
        };
        NonFinancialPresentationController.validateOTPforChangePwd(inputPayload, this.validateOTPSuccessforCP,
                                                                   this.validateOTPFailureForCP);
      } else{
        NonFinancialPresentationController.validateOTP(this.username,this._MFA, this.view.tbxOTP.text, this.mfa_key, this.AuthSuccess,
                                                       this.onValidateOTPFailure,this.correlationId);
      }
    }, 
    
    validateOTPSuccessforCP: function(response){
      this.commonEventHandler(this.showLoading, "");
      this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
    },

    validateOTPFailureForCP: function(error){
       if(!this.validateFailureCallbackScenario(error)){
        this.view.lblErrorOTP.text = "Invalid OTP entered, please enter valid OTP";
        this.commonEventHandler(this.dismissLoading, "");
      }
    },
    cancelOnClick : function(){
      this.mfa_key = "";
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      if(this.isRMSEnabled == true){
      NonFinancialPresentationController.rmsActionComplete(false,this.SCB_updateActionInRMS,this.FCB_updateActionInRMS);
      } 
      this.mandatoryEventHandler("actionCancel", this.analyzeActionFailure, ["Action cancelled"]);
    },

    AuthSuccess : function(response){
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      this.mfa_key = "";
      if(!this.isRMSEnabled){
        this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
        this.commonEventHandler(this.dismissLoading, "");
      } else{
        NonFinancialPresentationController.rmsActionSign(this.username,this._MFA,this.rmsActionSignSuccess, this.rmsActionSignFailure);
      }
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
          this.contextSwitch("Approve");
          NonFinancialPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                             this.initiateApproveFailure,this.correlationId);
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
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      this.mfa_key = "";
      if(response !== "deny"){
        status = this.validateFailureCallbackScenario(response);
      }
      if(!status){  
        this.approveView(false,"Approve");
        let errorText = "";
        if(response === "deny"){
			 if(this.isRMSEnabled == true){
          NonFinancialPresentationController.rmsActionComplete(false,this.SCB_updateActionInRMS,this.FCB_updateActionInRMS);
			 }
        //  this.mandatoryEventHandler("analyzeActionFailure", this.analyzeActionFailure, ["Action Denied"]);
          errorText = "Approve has been declined, please try again";
          
          //Approve Failure API call to RMS 
          if(this.isRMSEnabled == true){
            this.updateRMSServiceEvent("APPROVE_DENY");
          }
        } else if(response.includes("UNKNOWN")){
          errorText = "Approve timeout please try resend or try login using Approve secure code";
        } else if(response.message === "Approve poll Time Expired"){
          errorText = "Approve timeout please try resend or try login using Approve secure code";
          //Approve Timeout call to RMS
          if(this.isRMSEnabled == true){
            this.updateRMSServiceEvent("APPROVE_TIMEOUT");
          }
        } else {
          this.contextSwitch("Login");
          this.view.lblErrorLogin.text = "Error occurred while Login, please try again";
          this.onFailureCallback(response);
        }
        if(errorText !== ""){
          this.view.lblErrorApprove.isVisible = true;
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
                                                         this.initiateApproveFailure,this.correlationId);
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
	
    initiateApprove : function(rowNumber){
      this.view.flxPushDevices.setVisibility(false);
      this.view.lblErrorApprove.setVisibility(false);
      this.view.lblErrorApprove.text = "";
      let totalData = this.view.segmentPushDevices.data.slice();
      let data = totalData[rowNumber];
      this.deviceId = data.deviceId;
      NonFinancialPresentationController.initiateApprove(this.username, this.deviceId, this.initiateApproveSuccess,
                                                         this.initiateApproveFailure,this.correlationId);
    },   
    
    validatePassword : function(inputPayload){
      this.commonEventHandler(this.showLoading, "");
      NonFinancialPresentationController.validatePasswordforChangePwd(inputPayload, this.validatePasswordSuccessforCP,
                                                         this.validatePasswordFailureForCP);
    },
    validatePasswordSuccessforCP: function(response){
      this.commonEventHandler(this.dismissLoading, "");
      if(this._SecondFactor === "OTP_SMS" || this._SecondFactor === "OTP_EML"){
        NonFinancialPresentationController.sendOTP(this._SecondFactor, this.username, this.sendOTPSuccess, this.sendOTPFailure,this.correlationId);
      } else if (this._SecondFactor === "APPROVE") {
         this.deviceId = "";
          NonFinancialPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                             this.initiateApproveFailure,this.correlationId);
      }else if (this._SecondFactor === "OTP_HWT") {
        this._SecondFactor = "APPROVE";
        this.sendOTPSuccess("OTP_HWT");
      } else {
      this.mandatoryEventHandler("analyzeActionSuccess", this.analyzeActionSuccess, [""]);
      }
    },

    validatePasswordFailureForCP: function(error){
      this.view.lblErrorLogin.text = "Password is Incorrect";
      this.commonEventHandler(this.dismissLoading, "");
    },

    getClientAppProperties : function(){
     NonFinancialPresentationController.getClientAppProperties();     
    },
  };

});

