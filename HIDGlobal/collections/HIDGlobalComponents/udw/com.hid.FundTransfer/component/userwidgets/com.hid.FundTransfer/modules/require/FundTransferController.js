define(function() {

  var contexts = ["MainPage","TransferSuccess","UpdatePasswordTrans"];
  var sdkConstants = {};
  sdkConstants.ERROR_LENGTH_MIN = `PIN length should be atleast #`;
  sdkConstants.ERROR_LENGTH_MAX = `PIN length should be atmost #`;
  sdkConstants.ERROR_PWD_MIN_NUM = `PIN should contain atleast # numbers`;
  sdkConstants.ERROR_PWD_MAX_NUM = `PIN should contain atmost # numbers`;
  sdkConstants.ERROR_PWD_NO_ALPHA = `Password should contain only numbers`;
  sdkConstants.ERROR_PWD_MIN_ALPHA = `Password should contain atleast # letters`;
  sdkConstants.ERROR_PWD_MAX_ALPHA = `Password should contain atmost # letters`;
  sdkConstants.ERROR_PWD_MIN_UPPER = `Password should contain atleast # Uppercase letters`;
  sdkConstants.ERROR_PWD_MAX_UPPER = `Password should contain atmost # Uppercase letters`;
  sdkConstants.ERROR_PWD_MIN_LOWER = `Password should contain atleast # Lowercase letters`;
  sdkConstants.ERROR_PWD_MAX_LOWER = `Password should contain atmost # Lowercase letters`;  
  sdkConstants.ERROR_PWD_MIN_SPL = `Password should contain atleast # special Characters`;
  sdkConstants.ERROR_PWD_MAX_SPL = `Password should contain atmost # special Characters`;
  sdkConstants.ERROR_PWD_NOT_ENTERED = `Please Enter PIN`;
  sdkConstants.ERROR_PIN = `PIN is incorrect`;  
  var uiConstants  = {};
  uiConstants.ERROR_INVALID_ACCOUNT = `Please enter valid Account`;
  uiConstants.ERROR_INVALID_AMOUNT = `Please enter valid Amount`;
  uiConstants.ERROR_INVALID_REMARKS = `Please enter valid Remarks`;
  uiConstants.ERROR_TRANSACTION_FAILED = `Transfer confirmation failed please try again`;
  uiConstants.EMPTY_PIN = `Please enter PIN`;
  uiConstants.SUCCESS_SCREEN_TIMEOUT = 5;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.contextSwitch("MainPage");
      this.resetUI();
      this.view.txtEnterPin.onTouchStart = source=>this.showPwdPromptError(false,""); 
      this.view.btnTransferSubmit.onClick = this.showConfirmationPrompt;
      this.view.btnConfirmTS.onClick = this.btnTransferSubmit_onClick;
      this.view.btnDenyTs.onClick = source => this.view.flxConfirmPrompt.setVisibility(false)
      this.view.TransactionSigningMobileSDK.onPasswordPrompt = this.pwdPromtCallback;
      this.view.TransactionSigningMobileSDK.signTransactionSuccess = this.SCB_signTransaction;
      this.view.TransactionSigningMobileSDK.signTransactionFailure = this.FCB_signTransaction;
      this.view.TransactionSigningMobileSDK.passwordUpdateSuccess = this.SCB_passwordUpdate;
      this.view.TransactionSigningMobileSDK.passwordUpdateError = this.FCB_passwordUpdate;
      this.view.btnPasswordSubmit.onClick = this.btnPasswordSubmit_onClick;      
//      this.view.MobileApproveSDK.onUpdatePasswordSuccess = this.onUpdatePasswordSuccess;
      this.view.btnUpdatePINtrans.onClick = this.btnUpdatePINtrans_onClick;
      this.view.flxConfirmPrompt.setVisibility(false);
      this.view.tbxcurrency.setEnabled(false);     
       this.view.btnSecureCodeConfirmOk.onClick  = this.btnSecureCodeConfirmOk_onClick;
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, "username", function() {
        return this._username;
      });
      defineSetter(this, "username", function(val) {
        this._username = val;
        this.view.TransactionSigningMobileSDK.username = val;
      });
      
      defineGetter(this, "mode", function() {      
        return this._mode;
      });
      defineSetter(this, "mode", function(val) {
        this._mode = val;
        switch(this._mode){
          case "OTP":
            this.view.btnTransferSubmit.text = "Generate OTP";
            break;
          default:
            this.view.btnTransferSubmit.text = "Transfer";
        }
        this.view.TransactionSigningMobileSDK.mode = val;
      });
    },
	interval : 59,
    pwdPromtCallback : function(eventType, eventCode){
      this.view.txtEnterPin.text = "";
      this.setLoadingScreen(false);
      if(eventCode == "5000"){
        //this.contextSwitch("PasswordPrompt");
        this.setPasswordScreen(true);
      } if (eventCode == "5001"){
        this.showPwdPromptError(true, sdkConstants.ERROR_PIN);
      }
        if(eventCode == "5002"){
          // call Update Password flex.
          this.contextSwitch("UpdatePasswordTrans");        
        }
        this.view.forceLayout();
    },

    getvalue : function(){
      return this.updatePin;
    },

    ////////   Update Password method called here .............
    btnUpdatePINtrans_onClick : function(){
      kony.print("btnUpdatePINtrans_onClick");
      this.showErrorPassword(false, "");
      this.setLoadingScreen(true)
      
      let oldPwd = this.view.tbxCurrentPIN.text;
      let newPwd = this.view.tbxNewPIN.text;
      if(oldPwd == "" || newPwd == "" || !newPwd || !oldPwd){ 
        let error = sdkConstants.ERROR_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }      
      
      var policy = this.view.TransactionSigningMobileSDK.getPasswordPolicy() ;  
        if(policy) {
         this.passwordPolicy = JSON.parse(policy) || {};
         kony.print(JSON.stringify(this.passwordPolicy)); 
     }
       kony.print("ApproveSDKWrapper this.PasswordPolicy:"+JSON.stringify(this.passwordPolicy));                

      
      this.password = newPwd;
      kony.print("ApproveSDKWrapper : "+this.checkPasswordPolicy(newPwd));

      if(this.checkPasswordPolicy(newPwd)){      
        kony.print("ApproveSDKWrapper Updating my Password");
        this.view.TransactionSigningMobileSDK.updatePassword(oldPwd,newPwd);
      }
    },    
    
    showErrorPassword : function(visible,message = 'Please enter Valid PIN'){
      if(visible){
 //       this.view.lblErrorPassword.text = message;
        this.view.lblErrorPasswordPR.text = message;
      }
//      this.view.flxErrorPwd.setVisibility(visible);
      this.view.flxErrorPwdPR.setVisibility(visible);
      this.setLoadingScreen(false);
    },    
   
    btnPasswordSubmit_onClick : function(){
      let password = this.view.txtEnterPin.text;
      if(password == "" || password == null){
       this.showPwdPromptError(true, uiConstants.EMPTY_PIN);
//         this.showError(true, uiConstants.EMPTY_PIN);
        return;
      }
  //    this.showError(false, "");
      this.setLoadingScreen(true);
      this.view.TransactionSigningMobileSDK.validatePassword(password);
    },   
    
    //this.view.flxSecureCodePin.setVisibility(true);
    
    btnTransferSubmit_onClick : function(){
      this.view.TransactionSigningMobileSDK.mode = this._mode;
      this.view.flxConfirmPrompt.setVisibility(false);
      this.showError(false,"");
      let toAccount = this.view.tbxTransferTo.text;
      let amount = this.view.tbxAmount.text;
      let remarks = this.view.tbxRemarks.text;      
      let values = [];
      values.push(toAccount);
      values.push(amount);
      values.push(remarks); 
      this.setLoadingScreen(true);
      this.view.TransactionSigningMobileSDK.signTransaction(values); 
    },
    showConfirmationPrompt : function(){
      let toAccount = this.view.tbxTransferTo.text;
      let amount = this.view.tbxAmount.text;
      let remarks = this.view.tbxRemarks.text;
      let cnfTxt = `Dear customer you are about to transfer $${amount} to ${toAccount} with remarks ${remarks}.`;
      this.view.lblConfirmationInfo.text = cnfTxt;
       if(toAccount ==="" || isNaN(toAccount)){
         this.showError(true,uiConstants.ERROR_INVALID_ACCOUNT);
         return;
      }
      if(amount ==="" || isNaN(amount)){
         this.showError(true,uiConstants.ERROR_INVALID_AMOUNT);
         return;
      }
      if(remarks ===""){
         this.showError(true,uiConstants.ERROR_INVALID_REMARKS	);
         return;
      }
      this.view.flxConfirmPrompt.setVisibility(true);
      this.view.forceLayout();
    },

    SCB_passwordUpdate : function(){
      this.setLoadingScreen(false);
      this.view.TransactionSigningMobileSDK.validatePassword(this.password);
    }, 
    
    FCB_passwordUpdate : function(){
//      this.view.flxUpdatePasswordTrans.setVisibility(false);
      this.setLoadingScreen(false);
      this.showErrorPassword(true,error);
    },
    
    SCB_signTransaction : function(otp){
      if(this._mode== 'OTP')
        {
          this.resetUI();
          this.view.lblSecureCodeText.text = otp;        
          this.view.lblEnterPinError.setVisibility(false);
          this.view.flxSecureCodeConfirmation.setVisibility(true);
          this.view.flxLoading.setVisibility(false);
          this.view.flxSecureCodePin.setVisibility(true);
          kony.timer.schedule("timer",()=> this.timerFun(this.interval--), 1, true);
          this.view.flxEnableSecureCode.setVisibility(false);
          return;
        }
      this.setLoadingScreen(false);
      this.setPasswordScreen(false);
      this.contextSwitch("TransferSuccess");
      let toAccount = this.view.tbxTransferTo.text;
      let amount = this.view.tbxAmount.text;
      let cnfTxt = `$${amount} has been successfully transfered to account ${toAccount}`;
      this.view.lblTSSuccessMsg.text = cnfTxt;
      kony.timer.schedule("switchTimer", ()=> {
        this.resetUI();
        this.contextSwitch("MainPage");
        this.commonEventEmitter(this.onSuccess, ["success"]);
      },uiConstants.SUCCESS_SCREEN_TIMEOUT, false);
    },
    FCB_signTransaction : function(error){
      this.setLoadingScreen(false);
      this.setPasswordScreen(false);
      this.contextSwitch("MainPage");     
      this.showError(true,uiConstants.ERROR_TRANSACTION_FAILED);
    },
    timerFun : function(sec){   
      if(sec === 0){
        this.interval = 59;
        this.resetSecureCodeUI();          
      }
      var text = sec < 10 ? `0${sec}`:`${sec}`;
      this.view.lblSecureCodeTimeout.text =`This code will be display for ${text} more secs..`;
    },
   checkPasswordPolicy : function(pwd){
     kony.print("ApproveSDKWrapper : inside checkPasswordPolicy "+pwd);
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
        let error = sdkConstants.ERROR_LENGTH_MAX.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && noOfAlpha < +this.passwordPolicy.minAlpha){
        let error = sdkConstants.ERROR_PWD_MIN_ALPHA.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxAlpha") && noOfAlpha > +this.passwordPolicy.maxAlpha){
        let error = sdkConstants.ERROR_PWD_MAX_ALPHA.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minNumeric") && noOfNumeric < +this.passwordPolicy.minNumeric){
        let error = sdkConstants.ERROR_PWD_MIN_NUM.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && noOfNumeric > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_PWD_MAX_NUM.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minUpperCase") && noOfUpperCase < +this.passwordPolicy.minUpperCase){
        let error = sdkConstants.ERROR_PWD_MIN_UPPER.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxUpperCase") && noOfUpperCase > +this.passwordPolicy.maxUpperCase){
        let error = sdkConstants.ERROR_PWD_MAX_UPPER.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minLowerCase") && noOfLowerCase < +this.passwordPolicy.minLowerCase){
        let error = sdkConstants.ERROR_PWD_MIN_LOWER.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxLowerCase") &&  noOfLowerCase > +this.passwordPolicy.maxLowerCase){
        let error = sdkConstants.ERROR_PWD_MAX_LOWER.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minSpl") && noOfSpl < +this.passwordPolicy.minSpl){
        let error = sdkConstants.ERROR_PWD_MIN_SPL.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxSpl") && noOfSpl > +this.passwordPolicy.maxSpl){
        let error = sdkConstants.ERROR_PWD_MAX_SPL.replace(/#/,this.passwordPolicy.minLength );
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
        let error = sdkConstants.ERROR_LENGTH_MIN.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && pin.length > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_LENGTH_MAX.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      return true;
    },       
    
    contextSwitch : function(context){
      for(let i of contexts){
        this.view[`flx${i}`].setVisibility(i === context);
      }
    },
    commonEventEmitter : function(event,args){
      if(event){
        event.apply(this,args);
      }
    },
    setLoadingScreen : function(visible){
      this.commonEventEmitter(this.showLoading, [visible]);
      this.view.flxLoading.setVisibility(visible);
    },
    setPasswordScreen : function(visible){
       this.commonEventEmitter(this.onPasswordPrompt, [visible]);
      this.view.flxPasswordPrompt.setVisibility(visible);
    },
    showPwdPromptError : function(visible, message){
      this.setLoadingScreen(false);
      if(visible){
              this.view.lblTransferError.text = message;   
      }
      this.view.lblTransferError.setVisibility(visible);
    },
    showError : function(visible,message){
      this.setLoadingScreen(false);
      if(visible){
        this.view.lblErrorFundTransfer.text = message;        
      }
      this.view.flxTransferError.setVisibility(visible);      
    },
    resetUI : function(){
      this.resetSecureCodeUI();
      this.showError(false,"");
      this.showPwdPromptError(false,"");
      this.setLoadingScreen(false);
      this.setPasswordScreen(false);
      this.view.tbxTransferTo.text = "";
      this.view.tbxAmount.text = "";
      this.view.tbxRemarks.text = "";
      this.view.flxUpdatePasswordTrans.setVisibility(false);
      this.view.flxConfirmPrompt.setVisibility(false);
    },
    resetSecureCodeUI : function(){
      this.view.flxSecureCodePin.setVisibility(false);
      this.view.flxSecureCodeConfirmation.setVisibility(false);
      this.view.flxEnableSecureCode.setVisibility(false);
      this.view.lblSecureCodeText.text = "";
      this.view.tbxOtpEnterPin.text = "";
      kony.timer.cancel("timer");
      this.interval = 59;
      this.view.lblSecureCodeTimeout.text =`This code will be display for ${this.interval} more secs..`;
    },
    btnSecureCodeConfirmOk_onClick : function(){
    this.resetSecureCodeUI();
  },
 
  };
});