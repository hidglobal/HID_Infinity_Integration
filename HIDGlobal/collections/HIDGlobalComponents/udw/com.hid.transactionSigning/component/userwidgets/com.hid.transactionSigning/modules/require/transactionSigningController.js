define([`com/hid/transactionSigning/transactionSigningPresentationController`],function(transactionSigningPresentationController) {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.btnLogin.onClick = this.btnLogin_onClick;
      this.view.btnLoginOffline.onClick = this.btnLoginOffline_onClick;
      this.view.tbxCurrency.setEnabled(false);
      this.resetUIFeilds();
      this.resetTextFeilds();
      this.view.btnGenerateChallenge.onClick = this.btnGenerateChallenge_onClick;
      this.view.btnLoginChallenge.onClick = this.btnLoginChallenge_onClick;
      this.view.btnSendSMSOtp.onClick = this.btnSendSMSOtp_onClick;
      this.view.btnValidateOTP.onClick = this.btnValidateOTP_onClick;
      this.view.lblGenerateQR.onTouchEnd = this.lblGeneratorQR_onTouchEnd;
      this.view.lblOfflineManualEntry.onTouchEnd = this.lblOfflineManualEntry_onTouchEnd;
      this.setChallengeUI(false);
      this.changeTSMode("Approve");
    },
    initGettersSetters: function() {
      defineGetter(this, "username", function() {
        return this._username;
      });
      defineSetter(this, "username", function(val) {
        this._username = val;
      });

      defineGetter(this, "tds", function() {
        return this._tds;
      });
      defineSetter(this, "tds", function(val) {
        this._tds = val;
      });  
    },
   
    updateTSUI : function(response){
      this.resetUIFeilds();
      switch(response.state){
        case "approveTransactInitiateSuccess" :
          this.view.lblApproveSend.text = "A notification is send to the registered device please approve it to confirm the transaction.";
          this.view.lblApproveSend.skin = "sknlblTSThemeBlue"
          break;
        case "approveTransactInitiateFailure" :
          this.view.lblApproveSend.text = "";
          this.view.lblError.text = "Username not found";
          break;
        case "approveSuccess" :
          this.view.lblApproveSend.skin = "sknlblTSSuccess"
          this.view.lblApproveSend.text = "Transfer confirmation Approved";
          break;
        case "approveDenied" :
          this.view.lblApproveSend.text = "";
          this.view.lblError.text = "Transfer confirmation Denied";
          break;
        case "approveTimeOut":
          this.view.lblApproveSend.text = "";
          this.view.lblError.text = "Transfer confirmation timed out please try again";
          break;
        case "offlineTSSuccess" :
          this.view.lblTSSuccess.skin="sknlblTSSuccess";
          this.view.lblTSSuccess.text = "Transaction successfully completed.";
          this.commonEventHandler(this.onTSSuccess, "");
          break;  
        case "offlineTSFailure":
          this.view.lblTSSuccess.skin="sknlblTSError";
          this.view.lblTSSuccess.text = "Transfer confirmation failed please try again.";
          break; 
        case "generateChallengeSuccess":
          this.view.lblChallenge.text = response.response.challenge;
          this.setChallengeUI(true);
          break;
        case "generateChallengeFailure":
          this.view.lblErrorChallenge.text = "OTP Generation failed please try again";
          this.setChallengeUI(false);
          break;    
        case "validateChallengeSuccess" :
          //this.view.flxOTPChallenge.setVisibility(false);
          this.setChallengeUI(false);
          this.view.lblTSSuccessChallenge.text = "Transaction successfully completed.";
          this.commonEventHandler(this.onTSSuccess, "");
          break;   
        case "validateChallengeFailure":
          this.view.lblErrorChallenge.text = "Transfer confirmation failed please try again";
          this.setChallengeUI(false);
          break;  
        case "sendSMSOTPSuccess":
          this.view.lblsendSMSOTP.text = "SMS OTP Generation successfully.";
          this.setChallengeUI(true);
          break;
        case "sendSMSOTPFailure":
          this.view.lblErrorOTP.text = "OTP Generation failed please try again";
          this.setChallengeUI(false);
          break;
        case "validateSMSOTPSuccess":
          this.view.lblsendSMSOTP.text = "Transaction successfully completed.";
          this.setChallengeUI(true);
          break;
        case "validateSMSOTPFailure":
          this.view.lblErrorOTP.text = "Transfer confirmation failed please try again.";
          this.setChallengeUI(false);
          break;                
        default:
          alert("Invalid State");
      }
      this.commonEventHandler(this.dismissLoading, "");
      this.view.forceLayout();
    },
    initiate :function(){
      if(this._username === ""){
        this.view.lblErrorResponse.text = "Please enter Username";
        return;
      }
      if(this._tds === ""){
        this.view.lblErrorResponse.text = "Please enter Message";
        return;
      }
      this.view.lblMessage.text = "";
      this.view.lblErrorResponse.text = "";
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.aprroveTransact_Initiate(this.updateTSUI,this._username,this._tds);
    },
    btnLogin_onClick : function(){
      this.toAccount = this.view.tbxToAccount.text;
      this.amount = this.view.tbxAmount.text.trim();
      this.desc = this.view.tbxDescription.text;
      if(this.toAccount === "" || isNaN(this.toAccount)){
        this.view.lblError.text = `Please enter valid "to Account"`;
        return;
      }
      if(this.amount === "" || isNaN(this.amount)){
        this.view.lblError.text = "Please enter valid Amount";
        return;
      }      
      if(this.desc === ""){
        this.view.lblError.text = "Please enter Description";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      
      //call list of Devices
      transactionSigningPresentationController.getApproveDevices(this.username, this.getDeviceSuccess,
                                                               this.getDeviceFailure); 
 //     transactionSigningPresentationController.aprroveTransactInitiate(this.updateTSUI,this._username,toAccount,amount,desc);
    },
    
    getDeviceSuccess : function(response) {    
      if(response.length === 0){
        this.getDeviceFailure("");
      } else if(response.length > 1){
        this.view.flxTSApprove.setVisibility(false);
        this.view.flxPushDevices.setVisibility(true);
        
  //      this.contextSwitch("PushDevices");
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
          transactionSigningPresentationController.aprroveTransactInitiate(this.updateTSUI,this._username,this.deviceId,this.toAccount,this.amount,this.desc);
        }
    },    
    
    getDeviceFailure : function(response) {
      this.view.lblError.text = "No push device is registered, please complete enrollment process.";
      this.commonEventHandler(this.dismissLoading, "");
    },
    
    initiateApprove : function(rowNumber){
      this.view.flxPushDevices.setVisibility(false);  
      this.view.flxTSApprove.setVisibility(true);    
      this.commonEventHandler(this.showLoading, "");
      let totalData = this.view.segmentPushDevices.data.slice();
      let data = totalData[rowNumber];
      this.deviceId = data.deviceId;
            transactionSigningPresentationController.aprroveTransactInitiate(this.updateTSUI,this._username,this.deviceId, this.toAccount,this.amount,this.desc);
    },    
    
    lblGeneratorQR_onTouchEnd : function(){
      this.view.lblTSSuccess.text ="";
      let toAccount = this.view.tbxToAccountOffline.text;
      let amount = this.view.tbxAmountOffline.text.trim();
      let desc = this.view.tbxDescriptionOffline.text;
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = `Please enter valid "to Account"`;
        return;
      }
      if(amount === "" || isNaN(amount)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter valid Amount";
        return;
      }
      if(desc === ""){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter Description";
        return;
      }      
      QRdata = {
        "toAccount" : toAccount,
        "amount" : amount,
        "desc" : desc
      };
      this.view.qrcodegeneratorNew.dataToEncode = JSON.stringify(QRdata);
      this.view.qrcodegeneratorNew.generate();
      this.view.flxOfflineFields.setVisibility(false);
      this.view.flxQRCodeScan.setVisibility(true);
      this.view.forceLayout();
    },
    
    lblOfflineManualEntry_onTouchEnd(){
      this.view.flxQRCodeScan.setVisibility(false);
      this.view.flxOfflineFields.setVisibility(true);
      
    },
    
    btnLoginOffline_onClick : function(){
      let toAccount = this.view.tbxToAccountOffline.text ;
      let amount = this.view.tbxAmountOffline.text.trim();
      let desc = this.view.tbxDescriptionOffline.text;
      let OTP = this.view.tbxOTPOffline.text.trim();
      kony.print("Details "+ toAccount + amount + desc);
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = `Please enter valid "to Account"`;
        return;
      }
      if(amount === "" || isNaN(amount) || amount === undefined ){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter valid Amount";
        return;
      }      
      if(desc === "" || amount === undefined){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter Description";
        return;
      }
      if(OTP === "" || isNaN(OTP)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter valid Secure code";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      // alert("userName offline "+this._username);
      transactionSigningPresentationController.OfflineTS(this.updateTSUI,this._username,toAccount,amount,desc,OTP);
    },
    btnGenerateChallenge_onClick : function(){
      let toAccount = this.view.tbxToAccountChallenge.text;
      let amount = this.view.tbxAmountChallenge.text.trim();
      let desc = this.view.tbxDescriptionChallenge.text;
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblErrorChallenge.text = `Please enter valid "to Account"`;
        return;
      }
      if(desc === ""){
        this.view.lblErrorChallenge.text = "Please enter Description";
        return;
      }
      if(amount === "" || isNaN(amount)){
        this.view.lblErrorChallenge.text = "Please enter valid Amount";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.generateChallenge(this.updateTSUI,this._username);
    },
    btnLoginChallenge_onClick : function(){
      let OTP = this.view.tbxOTPChallenge.text.trim();
      if(OTP === "" || isNaN(OTP)){
        this.view.lblErrorChallenge.text = "Please enter OTP";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.validateChallenge(this.updateTSUI,this._username,OTP);
    },
    resetUIFeilds : function (){
      this.view.lblApproveSend.text = "";
      //this.view.lblApproveSend.text = "A notification is send to the registered device please approve it to confirm the transaction.";
      this.view.lblError.text = "";
      this.view.lblErrorOffline.text = "";
      this.view.lblTSSuccess.text = "";
      this.view.lblChallenge.text = "";
      this.view.lblTSSuccessChallenge.text = "";
      this.view.lblErrorChallenge.text = "";
      this.view.lblErrorOTP.text="";
      this.view.lblsendSMSOTP.text="";
      this.view.flxOfflineFields.setVisibility(true);
      this.view.flxQRCodeScan.setVisibility(false);
      this.view.flxPushDevices.setVisibility(false);
      
    },
    resetTextFeilds : function(){
      this.view.tbxToAccount.text = "";
      this.view.tbxAmount.text = "";
      this.view.tbxDescription.text = "";
      this.view.tbxToAccountOffline.text = "";
      this.view.tbxAmountOffline.text = "";
      this.view.tbxDescriptionOffline.text = "";
      this.view.tbxAmountChallenge.text = "";
      this.view.tbxToAccountChallenge.text = "";
      this.view.tbxDescriptionChallenge.text = "";
      this.view.tbxOTPChallenge.text = "";
      this.view.tbxOTPOffline.text = "";
      this.view.tbxToAccountSMS.text="";
      this.view.tbxAmountSMS.text="";
      this.view.tbxMessageSMS.text="";
      this.view.tbxSMSOTP.text="";
    },
    setChallengeUI : function(visible){
      this.view.lblChallenge.setVisibility(visible);
      this.view.flxOTPChallenge.setVisibility(visible);
      this.view.btnLoginChallenge.setVisibility(visible);
      this.view.lblsendSMSOTP.setVisibility(visible);
    },
    commonEventHandler(event,intent){
      if(event){
        event(intent);
      }
    },
    changeTSMode : function(mode){
      let modes = ["Approve","Offline","Challenge","SMS"];
      for(let i of modes){
        this.view[`flxTS${i}`].setVisibility(i===mode);
      }
      this.resetTextFeilds();
      this.resetUIFeilds();
    },
    btnSendSMSOtp_onClick : function(){
      let toAccount = this.view.tbxToAccountSMS.text;
      let amount = this.view.tbxAmountSMS.text.trim();
      let message = this.view.tbxMessageSMS.text;
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblErrorOTP.text = `Please enter valid "to Account"`;
        return;
      }
      if(amount === "" || isNaN(amount)){
        this.view.lblErrorOTP.text = "Please enter valid Amount";
        return;
      }
      if(message === ""){
        this.view.lblErrorOTP.text = "Please enter Message";
        return;
      }      
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.sendSMSOTP(this.updateTSUI,this._username,toAccount,amount,message,this.sendSMSOTP_Success,this.sendSMSOTP_Failure);      
    },
    btnValidateOTP_onClick : function(){
      let OTP = this.view.tbxSMSOTP.text.trim();
      if(OTP === "" || isNaN(OTP)){
        this.view.lblErrorOTP.text = "Please enter OTP";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.validateSMSOTP(this.updateTSUI,this._username,OTP);
    }
  };
});
