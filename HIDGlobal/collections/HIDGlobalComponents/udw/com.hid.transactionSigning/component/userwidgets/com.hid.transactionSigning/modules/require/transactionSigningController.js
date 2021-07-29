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
      let toAccount = this.view.tbxToAccount.text;
      let amount = this.view.tbxAmount.text.trim();
      let desc = this.view.tbxDescription.text;
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblError.text = `Please enter valid "to Account"`;
        return;
      }
      if(desc === ""){
        this.view.lblError.text = "Please enter Description";
        return;
      }
      if(amount === "" || isNaN(amount)){
        this.view.lblError.text = "Please enter valid Amount";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      transactionSigningPresentationController.aprroveTransactInitiate(this.updateTSUI,this._username,toAccount,amount,desc);

    },

    btnLoginOffline_onClick : function(){
      let toAccount = this.view.tbxToAccountOffline.text;
      let amount = this.view.tbxAmountOffline.text.trim();
      let desc = this.view.tbxDescriptionOffline.text;
      let OTP = this.view.tbxOTPOffline.text.trim();
      if(toAccount === "" || isNaN(toAccount)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = `Please enter valid "to Account"`;
        return;
      }
      if(desc === ""){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter Description";
        return;
      }
      if(amount === "" || isNaN(amount)){
        this.view.lblTSSuccess.skin="sknlblTSError";
        this.view.lblTSSuccess.text = "Please enter valid Amount";
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