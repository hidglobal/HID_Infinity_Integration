define(function() {

  var contexts = ["NonRMS","TransferSuccess","UpdatePassword","PasswordPrompt","RMS","TransferDeclined"];
  var sdkConstants = {};
  var isRMSTrans = false;
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
  sdkConstants.ERROR_PIN = `PIN is incorrect`; 
  sdkConstants.ERROR_SAME_PIN = `New PIN cannot be same as old PIN`;
  sdkConstants.ERROR_NEW_PWD_NOT_ENTERED = `Please enter the new PIN`;
  sdkConstants.ERROR_CNF_PWD = "Please confirm the new PIN";
  sdkConstants.ERROR_PWD_MATCH = `New PIN cannot be same as old PIN`
  sdkConstants.ERROR_INVALID_PWD_UPD = `Invalid PIN`
  sdkConstants.ERROR_INVALID_PIN = `PIN Cannot be Empty`;
  sdkConstants.ERROR_PWD_NOT_ENTERED = `Please enter PIN`;
  sdkConstants.ERROR_PWD_NOT_MATCH = `Entered PINs do not match`;
  var uiConstants  = {};
  uiConstants.ERROR_INVALID_ACCOUNT = `Please enter valid Account`;
  uiConstants.ERROR_INVALID_AMOUNT = `Please enter valid Amount`;
  uiConstants.ERROR_INVALID_REMARKS = `Please enter valid Remarks`;
  uiConstants.ERROR_TRANSACTION_FAILED = `Transfer confirmation failed please try again`;
  uiConstants.ERROR_TRANSACTION_FAILED_NONRMS = `Transfer failed please try again`;
  uiConstants.EMPTY_PIN = `Please enter PIN`;
  uiConstants.SUCCESS_SCREEN_TIMEOUT = 5;
  return {
    srcPaymentMode : "CB",
    patPaymentMode : "CB",
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.resetUI();
      this.view.txtEnterPin.onTouchStart = source=>this.showPwdPromptError(false,""); 
      this.view.btnTransferSubmit.onClick = this.showConfirmationPrompt;
      this.view.btnConfirmTS.onClick = this.btnTransferSubmit_onClick;
      this.view.btnDenyTs.onClick = source => {
        this.view.flxConfirmPrompt.setVisibility(false); 
        if(this._isRMS){
           this.commonEventEmitter(this.onConfirmationPrompt,[true]);
           this.view.flxRMS.setVisibility(true);
           this.view.forceLayout();
        }
      }
      this.view.TransactionSigningMobileSDK.onPasswordPrompt = this.pwdPromtCallback;
      this.view.TransactionSigningMobileSDK.signTransactionSuccess = this.SCB_signTransaction;
      this.view.TransactionSigningMobileSDK.signTransactionFailure = this.FCB_signTransaction;
      this.view.TransactionSigningMobileSDK.passwordUpdateSuccess = this.SCB_passwordUpdate;
      this.view.TransactionSigningMobileSDK.passwordUpdateError = this.FCB_passwordUpdate;
      this.view.TransactionSigningMobileSDK.onNotifyPassword = this.onNotifyPassword;
      this.view.TransactionSigningMobileSDK.onUpdatePasswordCB = this.onUpdatePasswordCB;
      this.view.payments.onRMSPaymentAccept = this.onRMSPaymentAccept;
      this.view.payments.onRMSPaymentDecline = this.onRMSPaymentDecline;
      this.view.payments.onRMSFailure = this.onRMSFailure;
      this.view.payments.onRMSSignSuccess = this.onRMSSignSuccess;
      this.view.payments.onRMSSignFailure = this.onRMSSignFailure;
      this.view.btnPasswordSubmit.onClick = this.btnPasswordSubmit_onClick;      
      //      this.view.MobileApproveSDK.onUpdatePasswordSuccess = this.onUpdatePasswordSuccess;
      this.view.btnUpdatePIN.onClick = this.btnUpdatePIN_onClick;
      this.view.flxConfirmPrompt.setVisibility(false);
      this.view.tbxcurrency.setEnabled(false);   
      this.view.tbxCurrencyRMS.setEnabled(false);
      this.view.btnSecureCodeConfirmOk.onClick  = this.btnSecureCodeConfirmOk_onClick;
      this.view.btnTransferSubmitRMS.onClick = this.btnTransferSubmitRMS_onClick;
      this.view.flxMainUpdatePwd.onTouchEnd = source => {
        
      };
      this.view.flxOpaqueUpdatePassword.onTouchEnd = source => {
      }
      this.view.flxIosBack.setVisibility(false);
      if(!this.isAndroid()){
         this.view.flxIosBack.onTouchEnd = source => this.onCompletionCallback(false);
      }
      this.resetUpdatePasswordUI();
      this.view.flxUpdatePassword.setVisibility(false);
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
      
       defineGetter(this, "isRMS", function() {
        return this._isRMS;
      });
      defineSetter(this, "isRMS", function(val) {
        this._isRMS = val;
        if(val == true) {
          this.view.flxRMS.setVisibility(true);
          this.view.flxNonRMS.setVisibility(false);
        }else{
          this.view.flxRMS.setVisibility(false);
          this.view.flxNonRMS.setVisibility(true);
        }
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
      kony.print(`ApproveSDK --> Inside pwdPromtCallback with eventType: ${eventType} and eventCode: ${eventCode}`);
      this.view.txtEnterPin.text = "";
      this.setLoadingScreen(false);
      if(eventCode == "5000"){
        this.setPasswordScreen(true);
      } if (eventCode == "5001"){
        this.setPasswordScreen(true);
        this.showPwdPromptError(true, sdkConstants.ERROR_PIN);
      }
      if(eventCode == "5002"){
        this.contextSwitch("UpdatePassword");        
      }
      this.view.forceLayout();
    },

    validationMeta : {
      Src : {
        Iban : [
          {
            id : "tbxSrcIban",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Iban"
          }
        ],
        CB : [
          {
            id : "tbxSrcAccNo",
            validation : function(str){
              if(!str) return false;
              if(isNaN(str)) return false;
              return true;
            },
            errMsg : "Invalid Source Account Number"
          },
          {
            id : "tbxSrcCountry",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Source Country"
          },
          {
            id : "tbxSrcCountryCode",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Source Bank Code"
          }
        ],
        Swift : [
          {
            id : "tbxSrcSwiftAccNo",
            validation : function(str){
              if(!str) return false;
              if(isNaN(str)) return false;
              return true;
            },
            errMsg : "Invalid Swift Account"
          },
          {
            id : "tbxSrcSwiftNo",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Swift"
          }
        ]
      },
      Pat : {
        Iban : [
          {
            id : "tbxPatIban",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Iban"
          }
        ],
        CB : [
          {
            id : "tbxPatAccNo",
            validation : function(str){
              if(!str) return false;
              if(isNaN(str)) return false;
              return true;
            },
            errMsg : "Invalid Patner Account Number"
          },
          {
            id : "tbxPatCountry",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Patner Country"
          },
          {
            id : "tbxPatCountryCode",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Patner Bank Code"
          }
        ],
        Swift : [
          {
            id : "tbxPatSwiftAccNo",
            validation : function(str){
              if(!str) return false;
              if(isNaN(str)) return false;
              return true;
            },
            errMsg : "Invalid Swift Account"
          },
          {
            id : "tbxPatSwiftNo",
            validation : function(str){
              if(!str) return false;
              return true;
            },
            errMsg : "Invalid Swift"
          }
        ]
      }
    },

    reqBaseTemplate : {
      app_user_id : function(){
        return this._username;
      },
      amount : function(){
        return this.view.tbxAmountRMS.text;
      },
      app_payment_id : function(){
        return Math.floor(Math.random()*10000000000)+1;
      },
      currency :  function(){
        return "USD";
      },
      payment_type : function(str){
        return "domestic";
      }
    },

    sourceAccountTemplate : {
      iban :{
        source_iban : function(){
          return this.view.tbxSrcIban.text;
        }
      },
      country_bank : {
        source_account_number : function(){
          return  this.view.tbxSrcAccNo.text;
        },
        source_bank_code : function(){
          return this.view.tbxSrcCountryCode.text;
        },
        source_country : function(){
          return this.view.tbxSrcCountry.text;
        }
      },
      swift: {
        source_swift_account_number : function(){
          return this.view.tbxSrcSwiftAccNo.text;
        },
        source_swift : function(){
          return this.view.tbxSrcSwiftNo.text;
        }
      }
    },
    
    patnerAccountTemplate : {
      iban :{
        patner_iban : function(){
          return this.view.tbxPatIban.text;
        }
      },
      country_bank : {
        partner_account_number : function(){
          return  this.view.tbxPatAccNo.text;
        },
        patner_country : function(){
          return this.view.tbxPatCountry.text;
        },
        patner_bank_code : function(){
          return this.view.tbxPatCountryCode.text;
        }
      },
    },
    getvalue : function(){
      return this.updatePin;
    },

    ////////   Update Password method called here .............
    btnUpdatePIN_onClick : function(){
      kony.print("ApproveSDK ---> btnUpdatePIN_onClick");
      this.showErrorPassword(false, "");
      this.setLoadingScreen(true)

      let oldPwd = this.view.tbxCurrentPIN.text;
      let newPwd = this.view.tbxNewPIN.text;
      let cnfPwd = this.view.tbxConfirmUpdPwd.text;
      
      if(oldPwd == "" || oldPwd == " " || oldPwd == undefined || oldPwd === null){
        let error = sdkConstants.ERROR_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(newPwd == "" || newPwd == " " || newPwd == undefined || newPwd === null){
        let error = sdkConstants.ERROR_NEW_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(cnfPwd == "" || cnfPwd == " " || cnfPwd == undefined || cnfPwd === null){
        let error = sdkConstants.ERROR_CNF_PWD;
        this.showErrorPassword(true,error);
        return;
      }
      if(oldPwd == newPwd ){ 
        let error = sdkConstants.ERROR_PWD_MATCH;
        this.showErrorPassword(true,error);
        return;
      }
      if(newPwd != cnfPwd){
        let error = sdkConstants.ERROR_PWD_NOT_MATCH;
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

    showErrorPassword : function(visible,message = 'Please enter PIN'){
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
      kony.print("ApproveSDK ---> Inside btnTransferSubmit_onClick ");
       if(this._isRMS) {
         this.isRMSTrans = true;
         this.btnTransferSubmit_onClick_RMS();
       }else{
         this.isRMSTrans = false;
         this.btnTransferSubmit_onClickNonRMS();
       } 
    },
    
    btnTransferSubmit_onClickNonRMS : function(){
      kony.print("ApproveSDK ---> Inside btnTransferSubmit_onClickNonRMS ");
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
    
    btnTransferSubmit_onClick_RMS : function(){
      kony.print("ApproveSDK ---> Inside btnTransferSubmit_onClick_RMS ");
      this.setLoadingScreen(true);
      const getReqModes = source=>{
        switch(source){
          case "Iban" : return "iban";
          case "CB" : return "country_bank";
          case "Swift" : return "swift";
        }
      }
      let sourceMode = getReqModes(this.srcPaymentMode);
      let patnerMode = getReqModes(this.patPaymentMode);
      let request  = this.getPaymentRequest(sourceMode, patnerMode);
      kony.print("ApproveSDK ---> payment Payload " + JSON.stringify(request));
      let sessionID = HidRmsSDKManager.getRMSAppSessionId() || null;
      kony.print("ApproveSDK ---> sessionID " + sessionID);
      this.view.payments.paymentCreate(request,sourceMode, patnerMode,sessionID);
      this.view.flxConfirmPrompt.setVisibility(false);
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
    
    showCnfPopup : function(cnfTxt){
      this.commonEventEmitter(this.onConfirmationPrompt, [false]);
      this.view.flxRMS.setVisibility(false);
      this.view.lblConfirmationInfo.text = cnfTxt;
      this.view.flxConfirmPrompt.setVisibility(true);
      this.view.forceLayout();
    },

    SCB_passwordUpdate : function(){
      this.setLoadingScreen(false);
      this.view.TransactionSigningMobileSDK.validatePassword(this.password);
    }, 

    FCB_passwordUpdate : function(eventType,message){
      kony.print(`ApproveSDK --> In FCB_passwordUpdate with eventType: ${eventType} and eventCode: ${message}`);
      this.setLoadingScreen(false);
      let error = sdkConstants.ERROR_PIN;
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
      let screen = "NonRMS"
      if(this._isRMS){
         kony.print("ApproveSDK ---> Sign Payment")
         this.view.payments.paymentSign("otp", "accepted");
         this.paymentStatus = "closed_accepted";
         screen = "RMS";
      }
      this.setLoadingScreen(false);
      this.setPasswordScreen(false);
      this.view.lblTSSuccessMsg.text = this.getCnfText();
      this.contextSwitch("TransferSuccess");
      kony.timer.schedule("switchTimer", ()=> {
        this.resetUI();
        this.contextSwitch(screen);
        this.commonEventEmitter(this.onSuccess, ["success"]);
      },uiConstants.SUCCESS_SCREEN_TIMEOUT, false);
    },
    getCnfText : function(){
      if(!this._isRMS){
        let toAccount = this.view.tbxTransferTo.text;
        let amount = this.view.tbxAmount.text;
        let cnfTxt = `$${amount} has been successfully transfered to account ${toAccount}`;
        return cnfTxt;
      }
      let fromAccTxtWidget = this.validationMeta.Src[this.srcPaymentMode][0].id;
      let toAccTxtWidget = this.validationMeta.Pat[this.patPaymentMode][0].id;
      let fromAccTxt = this.view[fromAccTxtWidget].text;
      let toAccTxt = this.view[toAccTxtWidget].text;
      let amountTxt = this.view.tbxAmountRMS.text;
      let remarksTxt = this.view.tbxRemarksRMS.text;
      let cnfTxt = `$${amountTxt} has been successfully transfered to account ${toAccTxt}`;
      return cnfTxt;
    },
    FCB_signTransaction : function(eventType,message){
      kony.print("ApproveSDK ---> FCB_signTransaction with eventType: "+eventType);
      this.setLoadingScreen(false);
      this.setPasswordScreen(false);
      if(this._isRMS){
        this.view.payments.paymentSign("otp", "rejected");
        this.paymentStatus = "closed_rejected";
        this.showRMSFailureScreen(uiConstants.ERROR_TRANSACTION_FAILED);
        return;
      }
      this.contextSwitch("NonRMS");
      this.showError(true,uiConstants.ERROR_TRANSACTION_FAILED_NONRMS);
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
      kony.print("Inside checkPinPolicy method")
      let isSequencePresent = this.seqCheckPin(pin);
      //       alert(isSequencePresent);
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
      if((isSequencePresent)){
        let error = "no sequential characters allowed";
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
    seqCheckPin: function(numberString) {
      if(this.sameSequence(numberString)){
        return true;
      }
      if(this.haveSequence(numberString)){
        return true;
      }
      return false;
    },
    sameSequence : function(s){
      let count = 0;
      let cur = 0;
      let prev = 0;
      let l = s.length;
      for(let i = 1;i < l;i++){
        cur = +s[i];
        prev = +s[i-1];
        if (cur-prev === 0){
          count += 1;
        }
        else{
          count = 0;
        }

        if (count === 3){
          return true;
        }
      }
      return false;
    },
    haveSequence : function(s){
      let l = s.length;
      let one = 0;
      let negativeone = 0;
      let cur = 0;
      let prev = 0;
      let currem = 0;
      let prevrem = 0;
      for(let i = 1;i < l; i ++){
        cur = +s[i];
        prev = +s[i-1];
        if(i < 4){
          if (cur - prev === 1){
            one += 1;
          }
          else if (cur - prev === -1){
            negativeone += 1;
          }
        }
        else{
          currem = +s[i-3];
          prevrem = +s[i-4];
          if (currem - prevrem === 1){
            one -= 1;
          }
          else if (currem - prevrem === -1){
            negativeone -= 1;
          }
          if (cur - prev === 1){
            one += 1;
          }
          else if (cur - prev === -1){
            negativeone += 1;
          }
        }
        if (one === 3 || negativeone === 3){
          return true;
        }
      }
      return false;
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
      this.view.flxUpdatePassword.setVisibility(false);
      this.view.flxConfirmPrompt.setVisibility(false);
      this.resetRMSUI();
      this.resetUpdatePasswordUI();
    },
    resetSecureCodeUI : function(){
      this.view.flxSecureCodePin.setVisibility(false);
      this.view.flxSecureCodeConfirmation.setVisibility(false);
      this.view.flxEnableSecureCode.setVisibility(false);
      this.view.lblSecureCodeText.text = "";
      this.view.tbxOtpEnterPin.text = "";
      try{
        kony.timer.cancel("timer");
      }catch(e){
          //Don't do anything
        } 
      this.interval = 59;
      this.view.lblSecureCodeTimeout.text =`This code will be display for ${this.interval} more secs..`;
    },
    resetUpdatePasswordUI : function(){
      this.view.tbxCurrentPIN.text = "";
      this.view.tbxNewPIN.text = "";
      this.view.tbxConfirmUpdPwd.text = "";
      this.showUpdatePINError(false);
      this.view.flxMainUpdatePwd.setVisibility(true);
      // this.view.flxUpdatePwdSuccess.setVisibility(false);
    },
    showUpdatePINError : function(visible,msg = ""){
      this.view.lblErrorPasswordPR.text  = msg;
      this.view.flxErrorPwdPR.setVisibility(visible);
      this.view.forceLayout();
    },
    btnSecureCodeConfirmOk_onClick : function(){
      this.resetSecureCodeUI();
    }, 
    
    resetRMSUI : function(){
      this.view.lblTransferErrorRMS.setVisibility(false);
      this.view.tbxPatAccNo.text = "";
      this.view.tbxPatCountry.text = "";
      this.view.tbxPatCountryCode.text = "";
      this.view.tbxSrcAccNo.text = "";
      this.view.tbxSrcCountry.text = "";
      this.view.tbxSrcCountryCode.text = "";
      this.view.tbxRemarksRMS.text = "";
      this.view.tbxAmountRMS.text = "";
      this.view.lblTransferErrorRMS.text = "";
    },

    validateSourceDetails : function(){
      let srcMode = this.srcPaymentMode;
      let validationArr = this.validationMeta.Src[srcMode];
      for(let obj of validationArr){
        let text = this.view[obj.id].text;
        if(!obj.validation(text)) {
          this.view.lblTransferErrorRMS.text = obj.errMsg;
          this.view.lblTransferErrorRMS.setVisibility(true);
          return false;
        }
      }
      return true;
    },

    validatePatnerDetails : function(){
      let srcMode = this.patPaymentMode;
      let validationArr = this.validationMeta.Pat[srcMode];
      for(let obj of validationArr){
        let text = this.view[obj.id].text;
        if(!obj.validation(text)) {
          this.view.lblTransferErrorRMS.text = obj.errMsg;
          this.view.lblTransferErrorRMS.setVisibility(true);
          return false;
        }
      }
      return true;
    },

    validateTransferDetails : function(){
      let amount = this.view.tbxAmountRMS.text;
      if(!amount || isNaN(amount)){
        this.view.lblTransferErrorRMS.text = "Invalid Amount";
        this.view.lblTransferErrorRMS.setVisibility(true);
        return false;
      }
      let remarks = this.view.tbxRemarksRMS.text;
      if(!remarks){
        this.view.lblTransferErrorRMS.text = "Remarks cannot be empty";
        this.view.lblTransferErrorRMS.setVisibility(true);
        return false;
      }
      return true;
    },
    getPaymentRequest : function(srcMode, patMode){
      let req = {};
      let temp = this.reqBaseTemplate
      let keys = Object.keys(temp);
      for(let key of keys){
        req[key] = temp[key].call(this);
      }
      let srcTemp = this.sourceAccountTemplate[srcMode];
      keys = Object.keys(srcTemp);
      for(let key of keys){
        req[key] = srcTemp[key].call(this);
      }
      let patTemp = this.patnerAccountTemplate[patMode];
      keys = Object.keys(patTemp);
      for(let key of keys){
        req[key] = patTemp[key].call(this);
      }
      return req;
    },
    
    btnTransferSubmitRMS_onClick : function(){
      this.view.lblTransferErrorRMS.setVisibility(false);
      if(!this.validateSourceDetails()) return;
      if(!this.validatePatnerDetails()) return;
      if(!this.validateTransferDetails()) return;
      let fromAccTxtWidget = this.validationMeta.Src[this.srcPaymentMode][0].id;
      let toAccTxtWidget = this.validationMeta.Pat[this.patPaymentMode][0].id;
      let fromAccTxt = this.view[fromAccTxtWidget].text;
      let toAccTxt = this.view[toAccTxtWidget].text;
      let amountTxt = this.view.tbxAmountRMS.text;
      let remarksTxt = this.view.tbxRemarksRMS.text;
      let msg = `You are about to transfer $${amountTxt} to ${toAccTxt} from ${fromAccTxt} with remarks : ${remarksTxt}`;
      this.tdsRMS = msg;
      this.showCnfPopup(msg);
    },
    
    onRMSPaymentAccept : function(success){
      kony.print("ApproveSDK ---> RMS Accepted");
     this.signTransactionSDK();
    },
    onRMSPaymentDecline : function(){
      kony.print("ApproveSDK ---> RMS Rejected");
      this.view.payments.paymentUpdate("closed_rejected");
      this.showRMSFailureScreen("Payment Declined");

    },
    onRMSFailure : function(error){
      kony.print("Savanth ---> RMS Failure " + JSON.stringify(error));
      this.signTransactionSDK();
    },
    signTransactionSDK : function(){
      let fromAccTxtWidget = this.validationMeta.Src[this.srcPaymentMode][0].id;
      let toAccTxtWidget = this.validationMeta.Pat[this.patPaymentMode][0].id;
      let fromAccTxt = this.view[fromAccTxtWidget].text;
      let toAccTxt = this.view[toAccTxtWidget].text;
      let amountTxt = this.view.tbxAmountRMS.text;
      let remarksTxt = this.view.tbxRemarksRMS.text;
      let values = [];
      values.push(fromAccTxt);
      values.push(toAccTxt);
      values.push(amountTxt); 
      values.push(remarksTxt);
      this.view.TransactionSigningMobileSDK.signTransaction(values); 
    },
    onRMSSignSuccess : function(success){
      kony.print("ApproveSDK ---> onRMSSignSuccess"+ JSON.stringify(success));
      this.view.payments.paymentUpdate(this.paymentStatus);
    },
    onRMSSignFailure : function(error){
      kony.print("ApproveSDK ---> onRMSSignFailure "+ JSON.stringify(error));
    },
    onNotifyPassword : function(){
      kony.print("ApproveSDK ---> FundTransfer onNotifyPassword ");
      this.isRMSTrans === false ? this.contextSwitch("NonRMS"):this.contextSwitch("RMS");
    },
    isAndroid : function(){
       var deviceInfo = kony.os.deviceInfo();
       return deviceInfo.name.toLowerCase() === 'android';
    },
    onUpdatePasswordCB: function(response){
    if(response === "success"){
      this.resetUI();
    } 
    this.view.forceLayout();
  },
    showRMSFailureScreen : function(msg){
      this.view.flxLoading.setVisibility(false);
      this.contextSwitch("TransferDeclined");
      this.view.lblTSFailure.text = msg;
      kony.timer.schedule("switchTimerNew", ()=> {
        this.resetUI();
        this.commonEventEmitter(this.onConfirmationPrompt, [true]);
        this.contextSwitch("RMS");
      },uiConstants.SUCCESS_SCREEN_TIMEOUT, false);
    }
  };
});
