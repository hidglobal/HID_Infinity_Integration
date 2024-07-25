define([`./approveSDKBusinessController`,`./ControllerImplementation`],function(businessController,controllerImplemetation) {
  var sdkConstants = {};
  sdkConstants.TS_NOTIFY_PASSWORD_MODE = "SIGN_TRASACTION";
  sdkConstants.TS_VALUES_SEPERATOR = "~";
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.nativeController = new controllerImplemetation(this,baseConfig.id);
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      
      defineGetter(this, "username", function() {
        return this._username;
      });
      defineSetter(this, "username", function(val) {
        this._username = val;
      });
      
      defineGetter(this, "mode", function() {
        return this._mode;
      });
      defineSetter(this, "mode", function(val) {
        this._mode = val;
      });
      defineGetter(this, "otpLabel", function(){
        return this._otpLabel;
      }); 
      defineSetter(this, "otpLabel", function(val){
        if(!["hotp","totp"].some(v=>v===val) ){
          throw {
            "type": "CUSTOM",
            "message": "otpLabel property is Invalid"
          };
        }
        this._otpLabel = val;
      });
    },
    signTransaction(values){
      this.valueArray = values;
      let valueStr = values.join(sdkConstants.TS_VALUES_SEPERATOR);
      this.nativeController.signTransaction(valueStr,this._otpLabel);
    },
    
    pwdPromtCallback : function(eventType,eventCode){
       this.commonEventEmitter(this.onPasswordPrompt, [eventType, eventCode]);
    },
    
    updatePassword : function(oldPwd,newPwd){
      kony.print("ApproveSDKWrapper : Inside updatePassword method");
      this.newPassword = newPwd ;
      this.nativeController.updatePassword(oldPwd,newPwd); 
    },
    
    getPasswordPolicy : function(){
      return this.nativeController.getPasswordPolicy();
    },
    
    exceptionCallback : function(exceptionType,message){
      kony.print(`ApproveSDK --> In exceptionCallback with exceptionType: ${exceptionType} and message: ${message}`);
      if(exceptionType == "UpdatePassword"){
        if(message == "updateSuccess"){
          kony.print("UpdatePassword Success");
          this.passwordUpdateSuccess();
          if(this.onUpdatePasswordCB){ 
//             this.onUpdatePasswordCB("success");
            this.commonEventEmitter(this.onUpdatePasswordCB,["success"]);
          } 
        } 
      } else if(exceptionType == "InvalidPasswordException"){
        this.onUpdatePasswordCB("InvalidPassword");
		this.passwordUpdateError(exceptionType,message);	
      } else if(exceptionType == "AuthenticationException"){
        this.onUatePasswordCB("InvalidPassword");
		this.passwordUpdateError(exceptionType,message);
      }else {
        this.onUpdatePasswordCB("error");
        this.passwordUpdateError(exceptionType,message);
      }
    },  
    passwordUpdateSuccess : function(){
      kony.print("ApproveSDK --> in passwordUpdateSuccess: ");
      this.commonEventEmitter(this.passwordUpdateSuccess, ["success"]);      
    },
    
    passwordUpdateError : function(exceptionType,message){
      kony.print("ApproveSDK --> in passwordUpdateError: ");
      this.commonEventEmitter(this.passwordUpdateError, [exceptionType,message]);  
    },
    
    validatePassword : function(password){
      kony.print("ApproveSDK --> in validatePassword:  OTP "+ password);
        this.nativeController.notifyPassword(password,sdkConstants.TS_NOTIFY_PASSWORD_MODE);
        this.commonEventEmitter(this.onNotifyPassword, [""]); 
    },
    
    SCB_signTransaction(otp){
      if(this._mode == "OTP")
      {
        kony.print("ApproveSDK --> in SCB_SignTransaction:  OTP "+ otp);
        this.commonEventEmitter(this.signTransactionSuccess, [otp]);        
      }
      else{
        kony.print("ApproveSDK --> in SCB_SignTransaction:  Validate Transaction OTP "+ otp);
        this.validateTransactionOTP(otp);
      }
    },
    FCB_signTransaction(exception,message){
      kony.print("ApproveSDK --> in FCB_signTransaction: "+exception + " " + message);
      this.commonEventEmitter(this.signTransactionFailure, [exception,message]);
    },
   
    validateTransactionOTP : function(otp){
     kony.print("ApproveSDK --> in validateTransactionOTP: "+otp);
     let values = this.valueArray;
     if(otp === "" || isNaN(otp)){ 
        return;
      }     
      let username = this._username;
      let tempArr = [];
      for(let i=0;i<values.length;i++){
        let temp = `sign${i+1}:${values[i]}:false`;
        tempArr[i] = temp;
      }
     let contentValue = tempArr.join(" ");
      kony.print("ApproveSDK Params: user:"+username+" otp:"+otp+" content:"+contentValue)
//   let tempStrng = `sign1:1234:false sign2:123:false sign3:test:false`
     let params =  {
      "username" : username,
      "password" : otp,
      "content"  : contentValue
    };
      businessController.validateTransactionOTP(params,this.validateTransactionOTPSuccess,this.validateTransactionOTPFailure);
    },
   
    validateTransactionOTPSuccess : function(success){
      kony.print("ApproveSDK --> validateTransactionOTPSuccess: ");
      this.commonEventEmitter(this.signTransactionSuccess, [success]);
//       alert(JSON.stringify(success));
    },
   
    validateTransactionOTPFailure : function(error){
      kony.print("ApproveSDK --> validateTransactionOTPFailure: " + JSON.stringify(error));
      this.commonEventEmitter(this.signTransactionFailure, [error]);
    },
    getUsername : function(){
       return this._username;
    },
    commonEventEmitter(event,args){
      if(event){
        event.apply(this,args);
      }
    }
  };
});