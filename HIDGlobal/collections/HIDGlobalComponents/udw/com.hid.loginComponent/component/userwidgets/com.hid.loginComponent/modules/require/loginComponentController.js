define(['com/hid/loginComponent/AuthenticationPresentationController'], function(AuthenticationPresentationController) {

  var contexts = ["Login","OTP","OTPError","PushDevices", "Approve","OOBPIN","Secure","ScanToApprove","ScanToApproveMain","LoginFIDO"];
  var clientProperties = {};
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUIFields();
      this.getClientAppProperties();
      this.view.btnLogin.onClick = this.loginPassword;
      this.view.tbxPassword.onDone = this.loginPassword;
      this.view.btnLoginOOBPIN.onClick = this.loginSMSOTP;
      this.view.tbxOOBPIN.onDone = this.loginSMSOTP;
      this.view.btnLoginSecure.onClick = this.loginSecureCode;
      this.view.tbxSecureCode.onDone = this.loginSecureCode;
      this.view.btnConfirmOTP.onClick = this.btnConfirmOTP_onClick;
      this.view.btnGenerate.onClick = this.generateQr;
      //this.view.lblSwitchLoginOption.onTouchStart = this.switchQr;
      kony.print("constructor firstfactor"+this._FirstFactor);
      this.view.btnLoginFIDO.onClick = this.loginFIDO;

      switch(this._FirstFactor){
        case "STATIC_PWD":
          this.contextSwitch("Login");
          break;
        case "OTP_SMS_PIN":
          this.contextSwitch("OOBPIN");
          break;
        case "SECURE_CODE":
          this.contextSwitch("Secure");
          break;
        case "USER_ID_LESS": {
          this.contextSwitch("ScanToApproveMain");
          //this.getScanToApproveQrData();
          break;
        }
        case "FIDO":
          this.contextSwitch("LoginFIDO");
          break;
      }
      this.TM_Cookie_Sid = "";
      this.TM_Cookie_Tag = "";
      this.tm_sid = "";
      this.tm_tag = "";
      this._adaptiveAuth ="";
    },
    app_session_id : "",
    //Logic for getters/setters of custom properties
    initGettersSetters: function() { 
      //Check for RMS enabled or not.
      defineGetter(this, "isRMSEnabled", function() {
        kony.print('isRMSEnabled:'+this._isRMSEnabled);
        return this._isRMSEnabled;
      });
      defineSetter(this, "isRMSEnabled", function(val){
        if(!(val) || val == undefined){
          this._isRMSEnabled = false;
        }else {
          this._isRMSEnabled = val;
        }
      });
      //Check for RMS Read Only or not.
      defineGetter(this, "isRMSReadOnly", function() {
        kony.print('isRMSReadOnly:'+this._isRMSReadOnly);
        return this._isRMSReadOnly;
      });
      defineSetter(this, "isRMSReadOnly", function(val){
        if(!(val) || val === undefined){
          this._isRMSReadOnly = false;
        }else {
          this._isRMSReadOnly = val;
        }
      });
      //Check for RMS defined Cookies
      defineGetter(this, "tmCookieSid", function() {
        return this.TM_Cookie_Sid;
      }); 
      defineSetter(this, "tmCookieSid", function(val){
        if(!(val) || val === undefined){
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
        if(!(val) || val === undefined){
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
        if(!(val)|| val === undefined){  
          this._adaptiveAuth=null;
        }
        this._adaptiveAuth = val;
      });
      defineGetter(this, "FirstFactor", function() {
        return this._FirstFactor;
      });
      defineSetter(this, "FirstFactor", function(val) {

        if(!["OTP_SMS_PIN","STATIC_PWD","SECURE_CODE","USER_ID_LESS","FIDO"].some(v=>v===val)){
          throw {
            "type": "CUSTOM",
            "message": "FirstFactor property is Invalid"
          };
        }
        kony.print("firstfactor called"+ val);
        if (val === "USER_ID_LESS"){
          this._FirstFactor = "APPROVE";
        }
        else{
        this._FirstFactor = val;
        }
      });
      defineGetter(this, "MFA", function() {
        return this._MFA;
      });
      defineSetter(this, "MFA", function(val) {
     /*   if(!["OTP_SMS","OTP_EML","APPROVE","OTP_HWT","NO_MFA"].some(v=>v===val)){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid"
          };
        }
        if(val !=="NO_MFA" && this._FirstFactor === "OTP_SMS_PIN"){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid.Please select MFA = NO_MFA for the selected FirstFactor"
          };
        }

        if(val === "NO_MFA" && !(["OTP_SMS_PIN","APPROVE","USER_ID_LESS","FIDO"].some(x => x === this.FirstFactor))){
          throw {
            "type": "CUSTOM",
            "message": "MFA property is Invalid.Cannot set MFA value = NO_MFA for selected FirstFactor"
          };
        }*/
        this._MFA = val;
      });
    },
    username : "",
    password : "",
    request_uri : "",
    csrf : "",
    gblTimer : null, 
    deviceTag : "",
    isKnownDevice : false,
    client_ip : "",
    newrequest : "",
    loginCorrelationIdPrefix: "LOGN-",
    correlationId : "",
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
      this.password = this.view.tbxPassword.text;
      this.correlationId = this.loginCorrelationIdPrefix + this.generateUUID();
      this.login(this._isRMSEnabled,this.username,this.password);
    },
    loginSecureCode : function(){     
      if(this.view.tbxUserSecure.text === ""){
        this.view.lblErrorSecure.text = "Please enter UserID";
        return;
      }
      if(this.view.tbxSecureCode.text === ""){
        this.view.lblErrorSecure.text = "Please enter Secure Code";
        return;
      }
      this.username = this.view.tbxUserSecure.text;
      this.password = this.view.tbxSecureCode.text;
      this.correlationId = this.loginCorrelationIdPrefix + this.generateUUID();
      this.login(this._isRMSEnabled,this.username,this.password);
      
    },
    
    loginFIDO : function() {
      this.username = this.view.tbxUserFIDO.text;
      this.commonEventHandler(this.showLoading, "");
      this.correlationId = this.loginCorrelationIdPrefix + this.generateUUID();
      AuthenticationPresentationController.getFIDOAuthentication(this.username, this.getFIDOAuthenticationSuccess,this.getFIDOAuthenticationFailure,this.correlationId);
    },
    
    getFIDOAuthenticationFailure: function(error) {
      // alert(error);
      this.commonEventHandler(this.dismissLoading, "");
      this.view.lblErrorLoginFIDO.text
        = "Authentication failed. Please try again.";
      this.view.lblErrorLoginFIDO.setVisibility(true);
      this.contextSwitch("LoginFIDO");
    },
    
    getFIDOAuthenticationSuccess: function(success) {
      this.view.lblErrorLoginFIDO.setVisibility(false);
      let response = success.FIDOAuthentication[0];
      const csrf = response["server-csrf-token"];
      let request_uri = response["request_uri"];
      let publicKey = response;
      
      publicKey.challenge = Uint8Array.from(
        window.atob(publicKey.challenge.replace(/_/g, '/').replace(/-/g, '+')),
        (c) => c.charCodeAt(0));
      
      publicKey.allowCredentials.forEach(cred =>
      {
        cred.id = Uint8Array.from(
          window.atob(cred.id.replace(/_/g, '/').replace(/-/g, '+')),
          (c) => c.charCodeAt(0));
      });
      
      publicKey.timeout = 60000;
      
      navigator.credentials.get({publicKey})
      .then(assertion => {
        const credential = {
          type: assertion.type,
          id: assertion.id,
          rawId: this.arrayBufferToBase64url(assertion.rawId),
          clientDataJSON: this.arrayBufferToBase64url(assertion.response.clientDataJSON),
          authenticatorData: this.arrayBufferToBase64url(assertion.response.authenticatorData),
          signature: this.arrayBufferToBase64url(assertion.response.signature),
          userHandle: this.arrayBufferToBase64url(assertion.response.userHandle)
        };
        let password = {
          "id": assertion.id,
          "response": {
            "clientDataJSON": credential.clientDataJSON,
            "authenticatorData": credential.authenticatorData,
            "signature": credential.signature,
            "userHandle": credential.userHandle
          }
        };
        this.password = password;
        this.request_uri = request_uri;
        this.csrf = csrf;
        this.login(this._isRMSEnabled,this.username, this.password, this.request_uri,this.csrf);
      })
      .catch((err) => {
        this.getFIDOAuthenticationFailure(err);
      });             
    },
    loginSMSOTP : function(){
      if(this.view.tbxUserOOBPIN.text === ""){
        this.view.lblErrorOOBPIN.text = "Please enter UserID";
        return;
      }
      if(this.view.tbxOOBPIN.text === ""){
        this.view.lblErrorOOBPIN.text = "Please enter PIN";
        return;
      }
      this.username = this.view.tbxUserOOBPIN.text;
      this.password = this.view.tbxOOBPIN.text;
      this.commonEventHandler(this.showLoading, "");
      this.correlationId = this.loginCorrelationIdPrefix + this.generateUUID();
      AuthenticationPresentationController.sendOTP(this._FirstFactor, this.username,this.sendSMSOTPSuccess, this.sendSMSOTPFailure, this.correlationId ,true, this.password);
    }, 
    sendSMSOTPSuccess : function(response){
      this.view.lblWelcome6.text = "HID Out Of Band SMS OTP";
      this.contextSwitch("OTP");
      this.commonEventHandler(this.dismissLoading, "");
    },
    sendSMSOTPFailure : function(error){
      this.view.lblErrorOOBPIN.text = "Username or PIN is invalid";
      this.view.lblErrorOOBPIN.setVisibility(true);
      this.commonEventHandler(this.dismissLoading, "");
    },
    btnConfirmOTP_onClick : function(){
      if(this.view.tbxOTP.text === ""){
        this.view.lblErrorOTP.text = "Please enter OTP";
        return;
      }
      this.password = this.view.tbxOTP.text;
      if(this._FirstFactor === "OTP_SMS_PIN"){
        this.login(this._isRMSEnabled,this.username,this.password);
      }else{
        this.validateOTP(this._MFA, this.password, this.mfa_key, this.AuthSuccess, this.onValidateOTPFailure);
      }    
    },
    
    login : function(isEnabled,username,password,request_uri="",csrf=""){
      if(isEnabled === true){
        this._FirstFactor == "FIDO" ? this.loginPasswordwithRMS(username,password,request_uri,csrf)
        :this.loginPasswordwithRMS(username,password);
      } else {
        this._FirstFactor == "FIDO" ? this.loginPasswordWithoutRMS(username,password,request_uri,csrf)
        :this.loginPasswordWithoutRMS(username,password);
      }
    },
    loginPasswordwithRMS : function(username,password, request_uri="",csrf="") {
      this.request_uri = request_uri;
      this.csrf = csrf;
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
      this.deviceTag = localStorage.getItem(`HID_deviceTag_${username}`); 
      if(this.deviceTag === null){
        this.isKnownDevice = false;
        this.deviceTag = this.tm_tag;
      }
      else{ 
        this.isKnownDevice = this.deviceTag===this.tm_tag;
      } 
      kony.print("RMS => isKnownDevice:"+this.isKnownDevice);
      var self = this;
      if(this.client_ip.trim() !== ""){
        this.rmsLoginApiCall(username,password);
      }else{        
        this.getClientIp();
      }
    }, 
    
    getClientIp: function(){
      AuthenticationPresentationController.getClientIp(this.getClientIpSuccess,this.getClientIpFailure);  
    },
    
    
    getClientIpSuccess: function(response){
      kony.print(JSON.stringify(response));
      if (response){
		this.client_ip = response.GetClientIp[0].clientIp;
      }
      else{
        this.client_ip = "";
      }
      if(this._FirstFactor == "FIDO"){
        this.rmsLoginApiCall(this.username,this.password,this.request_uri,this.csrf);
      }
      else{
        this.rmsLoginApiCall(this.username,this.password);
      }
      
    },
    
    getClientIpFailure: function(response){
      this.client_ip = "";
      this.rmsLoginApiCall(this.username,this.password);
      kony.print(JSON.stringify(response));
    },
   
    switchQr: function(){
      if (this.view.flxLogin.isVisible === true){
        
        this.view.flxLogin.setVisibility(false);
        this.view.flxScanToApprove.setVisibility(true);
        this.view.forceLayout();
        this.getScanToApproveQrData();
 
      }
      else{
        this.view.flxLogin.setVisibility(true);
        this.resetQrUi();
        this.view.forceLayout();
      }
      //this.view.authentication.resetUI();
    },
    
    
    generateQr: function(){
		this.contextSwitch("ScanToApprove");
      	this.correlationId = this.loginCorrelationIdPrefix + this.generateUUID();
		this.getScanToApproveQrData();
    },
    
    
    getScanToApproveQrData: function(){
		this.commonEventHandler(this.showLoading, "");
    	AuthenticationPresentationController.getScanToApproveQrData(this.getScanToApproveQrDataSuccess,this.getScanToApproveQrDataFailure,this.correlationId);
    },
	
	
	getScanToApproveQrDataSuccess: function(response){
      this.commonEventHandler(this.dismissLoading, "");
      kony.application.getCurrentForm().lblSwitchSignIn.setVisibility(false);
     // this.view.qrcodegeneratorNew.dataToEncode = response.getScanToApproveQrData[0].txid;
     // this.view.qrcodegeneratorNew.generate();
      this.view.QRCodeGenerator.generateQRCode(response.getScanToApproveQrData[0].txid);
      this.view.forceLayout();
      kony.print("firstfactor after logout" + this._Firstfactor);
      if (this._isRMSEnabled === true){
        kony.print("rms enabled");
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
      this.deviceTag = localStorage.getItem(`HID_deviceTag_${username}`); 
      if(this.deviceTag === null){
        this.isKnownDevice = false;
        this.deviceTag = this.tm_tag;
      }
      else{ 
        this.isKnownDevice = this.deviceTag===this.tm_tag;
      } 
      
      kony.print("RMS => isKnownDevice:"+this.isKnownDevice);
      var self = this;
      if(this.client_ip.trim() !== ""){
      let randomValue = this.generateUUID();
      this.app_session_id = String(randomValue);
      kony.print("app_session_id" + this.app_session_id);
      const rmsLoad = {
        "tm_sid" : this.tm_sid,
        "tm_tag" : this.tm_tag,
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id
      };
      //this.commonEventHandler(this.showLoading, "");
      AuthenticationPresentationController.pollForScanToApprove("",response.getScanToApproveQrData[0].auth_req_id,"APPROVE",this.pollForScanToApproveSuccess,this.pollForScanToApproveFailure,this.correlationId,rmsLoad);
       
      }else{
        
        this.getClientIpForScanToApprove(response);
//         const url = "https://api.ipify.org/?format=json"
//         fetch(url)
//           .then(response => response.json())
//           .then(data =>{ 
//           self.client_ip = data.ip;
//           self.rmsLoginApiCall(username,password);
//         });
      }
        
      }
      else{
      kony.print("rms not enabled");
      AuthenticationPresentationController.pollForScanToApprove("",response.getScanToApproveQrData[0].auth_req_id,"APPROVE",this.pollForScanToApproveSuccess,this.pollForScanToApproveFailure,this.correlationId);
      }
    },
    
    
    getClientIpForScanToApprove: function(response){
      AuthenticationPresentationController.getClientIpScanToApprove(response,this.getClientIpForScanToApproveSuccess,this.getClientIpForScanToApproveFailure);  
    },
    
    
    getClientIpForScanToApproveSuccess: function(qrDataResponse,response){
      kony.print(JSON.stringify(response));
      if (response){
		this.client_ip = response.GetClientIp[0].clientIp;
      }
      else{
        this.client_ip = "";
      }
      let randomValue = this.generateUUID();
      this.app_session_id = String(randomValue);
      kony.print("app_session_id" + this.app_session_id);
      const rmsLoad = {
        "tm_sid" : this.tm_sid,
        "tm_tag" : this.tm_tag,
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id
      };
      
      AuthenticationPresentationController.pollForScanToApprove("",qrDataResponse.getScanToApproveQrData[0].auth_req_id,"APPROVE",this.pollForScanToApproveSuccess,this.pollForScanToApproveFailure,this.correlationId,rmsLoad);
      
    },
    
    getClientIpForScanToApproveFailure: function(qrDataResponse,response){
      this.commonEventHandler(this.dismissLoading, "");
      this.client_ip = "";
      let randomValue = this.generateUUID();
      this.app_session_id = String(randomValue);
      kony.print("app_session_id" + this.app_session_id);
      const rmsLoad = {
        "tm_sid" : this.tm_sid,
        "tm_tag" : this.tm_tag,
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id
      };
      AuthenticationPresentationController.pollForScanToApprove("",qrDataResponse.getScanToApproveQrData[0].auth_req_id,"APPROVE",this.pollForScanToApproveSuccess,this.pollForScanToApproveFailure,this.correlationId,rmsLoad);
      //kony.print(JSON.stringify(response));
    },
   
    
    getScanToApproveQrDataFailure: function(response){
      kony.print("qr data failure"+ response);
      this.view.lblError.text = "Failed to generate Qr code, Someting went wrong. Click on button below to Genetrate Qr to try login again"
      this.view.lblError.skin = "sknHIDError";
      //this.view.qrcodegeneratorNew.dataToEncode = " ";
      //this.view.qrcodegeneratorNew.generate();
      this.view.QRCodeGenerator.generateQRCode(" ");
      this.commonEventHandler(this.dismissLoading, "");
      this.contextSwitch("ScanToApproveMain");
    },
    
    
    pollForScanToApproveSuccess: function(response,usercode){
      //kony.print("poll for scan to approve failure:" + response);
      this.view.lblError.skin = "sknScanToApproveNotfication";
      this.view.lblError.text = "Click on the Button below to generate a QR to login."
      this.username = usercode;
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
    },
	pollForScanToApproveFailure: function(response){
      kony.print("poll for scan to approve failure:" + response);
      if (response == "deny"){
        this.view.lblError.text = "Login Denied by User. Click on button below to Genetrate Qr to try login again."
      }
      else{
        this.view.lblError.text = "Login failed, Something went wrong. Click on button below to Genetrate Qr to try login again."
      } 
      this.view.lblError.skin = "sknScanToApproveError";
  //    this.view.qrcodegeneratorNew.dataToEncode = " ";
  //    this.view.qrcodegeneratorNew.generate();
      this.view.QRCodeGenerator.generateQRCode(" ");
      this.contextSwitch("ScanToApproveMain");
    },
    
   
    rmsLoginApiCall : function(username,password,request_uri="",csrf=""){
      let randomValue = this.generateUUID();
      this.app_session_id = String(randomValue) ;

      const rmsLoad = {
        "tm_sid" : this.tm_sid,
        "tm_tag" : this.tm_tag,
        "client_ip" : this.client_ip,
        "app_session_id" : this.app_session_id
      };
      this.commonEventHandler(this.showLoading, "");
      if(this._FirstFactor ==="STATIC_PWD"){
        AuthenticationPresentationController.validatePassword(username, password, this.onValidatePasswordRMSSuccess, this.onValidatePasswordRMSFailure,this.correlationId,rmsLoad);
      } else if(this._FirstFactor ==="FIDO"){
        AuthenticationPresentationController.authenticateFido(username, password, request_uri,csrf, this.firstFactorRMSSuccess, this.firstFactorRMSFailure,this.correlationId,rmsLoad);
      } else {
        AuthenticationPresentationController.authenticateFirstFactor(username, password, this._FirstFactor, this.firstFactorRMSSuccess, this.firstFactorRMSFailure,this.correlationId,rmsLoad);              
      }
    },
    firstFactorRMSSuccess : function(response){      
      switch(this._FirstFactor){
        case "OTP_SMS_PIN":
          this.authenticateOOBPINRMSSuccess(response);
          break;
        case "SECURE_CODE":
          this.authenticateSecureRMSSuccess(response);
          break;
        case "FIDO":
          this.authenticateFidoRMSSuccess(response);
          break;
      }      
    },
    firstFactorRMSFailure : function(error){
      switch(this._FirstFactor){
        case "OTP_SMS_PIN":
          this.authenticateOOBPINRMSFailure(error);
          break;
        case "SECURE_CODE":
          this.authenticateSecureRMSFailure(error);
          break;
        case "FIDO":
          this.authenticateFidoRMSFailure(error);
          break;
      }   
    },
    authenticateOOBPINRMSSuccess : function(response){
      alert(JSON.stringify(response.mfa_meta.rms));
      this.mfa_key = response.mfa_meta.auth_id;
      var noStepup = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "false";
      var stepUp = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "true";
      this.currentThreat = +response.mfa_meta.rms.currentThreat || 10;
      if(noStepup){
        //If isRMSReadOnly then donot perform stepdown
        kony.print("RMS => isRMSReadOnly:"+this._isRMSReadOnly);
        if(this._isRMSReadOnly === false){
          this.updateRMSServiceEvent("STEP_DOWN");
          return;
        }
      }
      this.commonEventHandler(this.dismissLoading, "");
      this.initiateSecondFactor();
      this.client_ip="";
    },
    authenticateOOBPINRMSFailure : function(error){
      kony.print("authenticateOOBPINRMSFailure error:"+JSON.stringify(error));
      if(error.details.message.includes("USER-BLOCK") && error.details.message.includes(-3)){
        this.view.lblErrorOTP.text = "User is blocked for Login";
      } else {
        this.view.lblErrorOTP.text = "Username or PIN is Invalid";
      }
      if(error.details.message.includes("Reason indicating that OTP did not match")){
        this.view.lblErrorOTP.text = "Invalid OTP entered, please enter valid OTP";
      }
      this.commonEventHandler(this.dismissLoading, "");
      this.client_ip="";
    },
    
    authenticateSecureRMSSuccess : function(response){
      kony.print("authenticateSecureRMSSuccess response:"+JSON.stringify(response.mfa_meta.rms));
      this.rmsScoreSuccess(response);
    },
    authenticateSecureRMSFailure : function(error){
      kony.print("authenticateSecureRMSFailure error:"+JSON.stringify(error));
      this.rmsScoreFailure(error);
    },
    authenticateFidoRMSSuccess : function(response){
      kony.print("authenticateFidoRMSSuccess response:"+JSON.stringify(response.mfa_meta.rms));
      this.rmsScoreSuccess(response);
    },
    authenticateFidoRMSFailure : function(error){
      kony.print("authenticateFidoRMSFailure error:"+JSON.stringify(error));
      this.rmsScoreFailure(error);
    },
    onValidatePasswordRMSSuccess : function(response){
      kony.print("onValidatePasswordRMSSuccess response:"+JSON.stringify(response.mfa_meta.rms));
      this.rmsScoreSuccess(response);
    },
    onValidatePasswordRMSFailure : function(error){
      kony.print("onValidatePasswordRMSFailure error:"+JSON.stringify(error));
      this.rmsScoreFailure(error);
    },
    rmsScoreSuccess : function(response){
      alert(JSON.stringify(response.mfa_meta.rms));
      this.mfa_key = response.mfa_meta.auth_id;
      var noStepup = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "false";
      var stepUp = response.mfa_meta.rms.hasOwnProperty("stepUp") && response.mfa_meta.rms.stepUp === "true";
      this.currentThreat = +response.mfa_meta.rms.currentThreat || 10;
      if(noStepup){
        //If isRMSReadOnly then donot perform stepdown
        kony.print("RMS => isRMSReadOnly:"+this._isRMSReadOnly);
        if(this._isRMSReadOnly === false){
          this.updateRMSServiceEvent("STEP_DOWN");
          return;
        }
      }
      this.factorType = response.mfa_meta.rms.hasOwnProperty("factorType") ;
      this.commonEventHandler(this.dismissLoading, "");
      var adaptiveMFA = this._MFA;
      this.initiateSecondFactor();
      this.client_ip="";
    },
    rmsScoreFailure : function(error){     
      if(error.details.message.includes("USER-BLOCK") && error.details.message.includes(-3)){
        if(this._FirstFactor === "STATIC_PWD"){
          this.view.lblErrorLogin.text = "User is blocked for Login";
        } else {
          this.view.lblErrorSecure.text = "User is blocked for Login";
        }
      } else {
        if(this._FirstFactor === "STATIC_PWD" || this._FirstFactor === "FIDO"){
          this.view.lblErrorLogin.text = "Username or Password is invalid";
        } else {
          this.view.lblErrorSecure.text = "Username or Secure code is invalid";
        }       
      }
      this.commonEventHandler(this.dismissLoading, "");
      this.client_ip="";
    },
    updateRMSServiceEvent : function(rmsevent){
      if(rmsevent === "STEP_DOWN" && this._FirstFactor !=="OTP_SMS_PIN"){
        AuthenticationPresentationController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onStepDownSuccessCB, this.onStepDownFailureCB ,this.correlationId);
      }else if(rmsevent === "STEP_DOWN" && this._FirstFactor ==="OTP_SMS_PIN"){
        AuthenticationPresentationController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onStepDownSuccessCB, this.onStepDownFailureCB, this.password,this.correlationId);
      }else if((rmsevent === "APPROVE_DENY") || (rmsevent === "APPROVE_TIMEOUT")){
        AuthenticationPresentationController.updateRMSServiceEvent(rmsevent, this.mfa_key, this.onApproveRMSEventSuccessCB, this.onApproveRMSEventFailureCB,this.correlationId);
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
      this.client_ip = "";      
      this.commonEventHandler(this.onSuccessCallback,response);
      this.commonEventHandler(this.dismissLoading, "");
    },
    onStepDownFailureCB : function(error){
      switch(this._FirstFactor){
        case "STATIC_PWD":
          this.view.lblErrorLogin.text = "Something went wrong Please after sometime " + error;
          break;
        case "OTP_SMS_PIN":
          this.view.lblErrorOOBPIN.text = "Something went wrong Please after sometime " + error;
          break;
        case "SECURE_CODE":
          this.view.lblErrorSecure.text = "Something went wrong Please after sometime " + error;
          break;
      }
      
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
        if(res === true){
          localStorage.setItem(`HID_deviceTag_${this.username}`,tag);         
        }    
      }
      kony.ui.Alert(basicConf, pspConfig);
    },

    loginPasswordWithoutRMS : function(username,password,request_uri="",csrf=""){
      this.commonEventHandler(this.showLoading, "");
      if(this._FirstFactor ==="STATIC_PWD"){
        AuthenticationPresentationController.validatePassword(username, password, this.onValidatePasswordSuccess, this.onValidatePasswordFailure,this.correlationId);
      } else if(this._FirstFactor ==="FIDO"){
        AuthenticationPresentationController.authenticateFido(username, password, request_uri,csrf, this.firstFactorSuccess, this.firstFactorFailure,this.correlationId);
      } else {
        AuthenticationPresentationController.authenticateFirstFactor(username, password, this._FirstFactor, this.firstFactorSuccess, this.firstFactorFailure,this.correlationId);             
      }
    },
    firstFactorSuccess : function(response){      
      switch(this._FirstFactor){
        case "OTP_SMS_PIN":
          this.authenticateOOBPINSuccess(response);
          break;
        case "SECURE_CODE":
          this.authenticateSecureSuccess(response);
          break;
        case "FIDO":
          this.authenticateFidoSuccess(response);
          break;
      }      
    },
    firstFactorFailure : function(error){
      switch(this._FirstFactor){
        case "OTP_SMS_PIN":
          this.authenticateOOBPINFailure(error);
          break;
        case "SECURE_CODE":
          this.authenticateSecureFailure(error);
          break;
        case "FIDO":
          this.authenticateFidoFailure(error);
          break;
      }
    },   
    authenticateOOBPINSuccess: function(response){
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
    },
    authenticateOOBPINFailure: function(error){
      if(!this.validateFailureCallbackScenario(error)){
        this.view.lblErrorOTP.text = "Invalid OTP entered, please enter valid OTP";
      }
      this.commonEventHandler(this.dismissLoading, "");
    },
    authenticateSecureSuccess : function(response){
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
    },
    authenticateSecureFailure : function(error){
      this.view.lblErrorSecure.text = "Username or Secure code is invalid";
      this.commonEventHandler(this.dismissLoading, "");
    },
    authenticateFidoSuccess : function(response){
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
	},
    authenticateFidoFailure : function(error){
      this.commonEventHandler(this.dismissLoading, "");
		alert(JSON.stringify(error));
    },
    onValidatePasswordSuccess : function(response){
      this.mfa_key = response.mfa_meta.auth_id;
      this.initiateSecondFactor();
    },
    onValidatePasswordFailure : function(error){
      this.view.lblErrorLogin.text = "Username or Password is invalid";
      this.commonEventHandler(this.dismissLoading, "");
    },
    initiateSecondFactor : function(){
      switch(this._MFA){
        case "OTP_SMS":
          AuthenticationPresentationController.sendOTP(this._MFA, this.username, this.sendOTPSuccess, this.sendOTPFailure,this.correlationId);
          break;
        case "OTP_EML":
          AuthenticationPresentationController.sendOTP(this._MFA, this.username, this.sendOTPSuccess, this.sendOTPFailure,this.correlationId);
          break;
        case "APPROVE":
          AuthenticationPresentationController.getApproveDevices(this.username, this.getDeviceSuccess, this.getDeviceFailure,this.correlationId);
          break;
        case "OTP_HWT":
          this._MFA = "APPROVE";
          this.sendOTPSuccess("OTP_HWT");
          break;
        case "NO_MFA":
          if(this._isRMSEnabled === true){
	    AuthenticationPresentationController.validateOTP("STEP_DOWN", this.password, this.mfa_key, this.AuthSuccess, this.onValidateOTPFailure,this.correlationId);
          } else {
	    AuthenticationPresentationController.validateOTP(this._MFA, this.password, this.mfa_key, this.AuthSuccess, this.onValidateOTPFailure,this.correlationId);
	  }
          break;
          
        case "STEP_DOWN":
          AuthenticationPresentationController.validateOTP(this._MFA, this.password, this.mfa_key, this.AuthSuccess, this.onValidateOTPFailure,this.correlationId);
          break;
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
      this.commonEventHandler(this.dismissLoading, "");
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
                                                       this.onValidateOTPFailure,this.correlationId);
    }, 
    AuthSuccess : function(response){
      if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
      }
      this.mfa_key = "";
      this.client_ip = "";
      this.resetQrUi();
      this.commonEventHandler(this.onSuccessCallback,response);
      this.commonEventHandler(this.dismissLoading, "");
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
        switch(this._FirstFactor){
          case "OTP_SMS_PIN":
            this.contextSwitch("OOBPIN");
            this.view.lblErrorOOBPIN.text = errorMessage;
            break;
          case "SECURE_CODE":
            this.contextSwitch("Secure");
            this.view.lblErrorSecure.text = errorMessage;
            if(this._MFA === "APPROVE"){
              clearInterval(this.gblTimer);
            }
            break;
          case "STATIC_PWD":
            this.contextSwitch("Login");
            this.view.lblErrorLogin.text = errorMessage;
            if(this._MFA === "APPROVE"){
              clearInterval(this.gblTimer);
            }
            break;
          case "FIDO":
            this.contextSwitch("LoginFIDO");
            break;
        }        
        this.commonEventHandler(this.onFailureCallback,errorMessage);
        this.commonEventHandler(this.dismissLoading, "");
        return true;
      }
      return false;
    }, 
    cancelOnClick : function(){
      this.mfa_key = "";
      if(this._FirstFactor === "OTP_SMS_PIN"){
        this.contextSwitch("OOBPIN");
      }else{
        if(this._MFA === "APPROVE"){
        clearInterval(this.gblTimer);
        AuthenticationPresentationController.cancelApprovePolling();
        }
        if(this._FirstFactor === "STATIC_PWD"){
          this.contextSwitch("Login");
        }else{
          this.contextSwitch("Secure");
        }
        
      }
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
        this.view.segmentPushDevices.data = deviceData;
        this.commonEventHandler(this.dismissLoading, ""); } 
       else {
          this.deviceId = "";
          AuthenticationPresentationController.initiateApprove(this.username, "", this.initiateApproveSuccess,
                                                               this.initiateApproveFailure,this.correlationId);
        }
    }, 
    initiateApprove : function(rowNumber){
      this.commonEventHandler(this.showLoading, "");
      let totalData = this.view.segmentPushDevices.data.slice();
      let data = totalData[rowNumber];
      this.deviceId = data.deviceId;
      AuthenticationPresentationController.initiateApprove(this.username, this.deviceId, this.initiateApproveSuccess,
                                                           this.initiateApproveFailure,this.correlationId);
    },
    getDeviceFailure : function(response) {
      this.approveView(false, "Approve");
      this.view.lblApproveNot.text = "No push device is registered, please complete enrollment process.";
      this.commonEventHandler(this.dismissLoading, "");
    },
    initiateApproveSuccess : function(response){
      if(this._FirstFactor === "SECURE_CODE"){
        this.view.flxTimer.height = "40%";
        this.view.lblTimerNot.centerX = "51%";
        this.view.lblTimerNot.centerY = "30%";
        this.view.lblResendNot.centerX = "46%";
        this.view.lblResendNot.centerY = "60%";     
        this.view.flxApproveBtns.setVisibility(false);
      }
      this.approveView(true, "Approve");
      this.commonEventHandler(this.dismissLoading, "");
      this.view.lblApproveNot.text = "We've sent a notification to your device. Approve the notification to continue.";
      AuthenticationPresentationController.pollForApprove(response, this.mfa_key, this.AuthSuccess,
                                                          this.onApproveFailure,this.correlationId);
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
          switch(this._FirstFactor){
            case "STATIC_PWD":
              this.contextSwitch("Login");
              this.view.lblErrorLogin.text = "Error occurred while Login, please try again";
              break;
            case "OTP_SMS_PIN":
              this.contextSwitch("OOBPIN");
              this.view.lblErrorOOBPIN.text = "Error occurred while Login, please try again";
              break;
            case "SECURE_CODE":
              this.contextSwitch("Secure");
              this.view.lblErrorSecure.text = "Error occurred while Login, please try again";
              break;          
          }
          this.commonEventHandler(this.onFailureCallback,response);
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
      this.resetUIFields();
      return;
    }, 
    onLogoutFailure : function(error){
      this.view.lblAuthStatus.text = "Failed to logout";
      return;
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
                                                           this.initiateApproveFailure,this.correlationId);
    }, 
    contextSwitch: function(context) {
      if (context === "ScanToApproveMain" || context === "ScanToApprove"){
        this.commonEventHandler(this.changeContext,"ApproveAuth");
      }
      else{
      	this.commonEventHandler(this.changeContext,context+"Auth");
      }
      this.resetUIFields();
      for (let i of contexts) {
        this.view[`flx${i}`].setVisibility(i === context);
      }
      this.view.forceLayout();
    }, 
    resetUIFields : function(){
      this.view.tbxUser.text = "";
      this.view.tbxPassword.text = "";
      this.view.tbxUserOOBPIN.text = "";
      this.view.tbxOOBPIN.text = "";
      this.view.tbxUserSecure.text = "";
      this.view.tbxSecureCode.text = "";
      this.view.lblErrorLogin.text = "";
      this.view.lblErrorOOBPIN.text = "";
      this.view.lblErrorSecure.text = "";
      this.view.tbxOTP.text = "";
      this.view.lblErrorOTP.text = "";
      this.view.lblSendOtpError.text = "";
      this.view.lblApproveNot.text = "";
      this.view.lblErrorApprove.text = "";
      this.view.lblTimerNot.text = "";
    },
    resetUI : function(){
      if(this._FirstFactor === "STATIC_PWD"){
        this.contextSwitch("Login");
      } else if(this._FirstFactor === "OTP_SMS_PIN"){
        this.contextSwitch("OOBPIN");
      } else if (this._FirstFactor === "SECURE_CODE"){
        this.contextSwitch("Secure");
      } else if (this._FirstFactor === "FIDO") {
        this.contextSwitch("LoginFIDO");
      } 
      else if (this._FirstFactor === "APPROVE" || this._FirstFactor === "USER_ID_LESS"){
        this.contextSwitch("ScanToApproveMain");
        //this.getScanToApproveQrData();
      }    
    },
    
    
    resetQrUi: function(){
      //this.view.flxScanToApprove.setVisibility(false);
      //this.contextSwitch("ScanToApproveMain");
      this.view.lblError.skin = "sknScanToApproveNotfication";
      this.view.lblError.text = "Click on the Button below to generate a QR to login."
     // this.view.qrcodegeneratorNew.dataToEncode = " ";
     // this.view.qrcodegeneratorNew.generate();
     this.view.QRCodeGenerator.generateQRCode(" ");
    },
    
    getUserName : function(){
      return this.username;
    },
    getRmsSessionId : function(){
      return this.app_session_id;
    },      
    arrayBufferToBase64url : function(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    
    return window.btoa(binary)
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  	},
    
    commonEventHandler(event,intent){
      if(event){
        event(intent);
      }
    },
    
    generateUUID: function() {
      const crypto = window.crypto || window.msCrypto;
      const buffer = new Uint16Array(8);
      crypto.getRandomValues(buffer);

      buffer[3] &= 0x0fff;
      buffer[3] |= 0x4000;
      buffer[4] &= 0x3fff;
      buffer[4] |= 0x8000;

      return buffer.reduce((str, byte, i) => {
        const hex = byte.toString(16).padStart(4, '0');
        return str + (i === 2 || i === 4 || i === 6 ? '-' : '') + hex;
      }, '');
    },

    getClientAppProperties : function(){
     AuthenticationPresentationController.getClientAppProperties();     
    }
  };
});
