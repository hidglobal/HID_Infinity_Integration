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
      if(exceptionType == "UpdatePassword"){
        if(message == "updateSuccess"){
          kony.print("UpdatePassword Success");
          this.passwordUpdateSuccess();
        } 
      } else if(exceptionType == "InvalidPasswordException"){
			this.passwordUpdateError();	
      } else if(exceptionType == "AuthenticationException"){
			this.passwordUpdateError();
      }else {
        this.passwordUpdateError();
      }
  },
    
    
    passwordUpdateSuccess : function(){
      this.commonEventEmitter(this.passwordUpdateSuccess, ["success"]);      
    },
    
    passwordUpdateError : function(){
      this.commonEventEmitter(this.passwordUpdateError, ["InvalidPassword"]);  
    },
    
    validatePassword : function(password){
       this.nativeController.notifyPassword(password,sdkConstants.TS_NOTIFY_PASSWORD_MODE);
    },
    
    SCB_signTransaction(otp){
      kony.print("ApproveSDK in SCB_SignTransaction:  Validate Transaction OTP "+ otp);
      if(this._mode == "OTP")
        {
          this.commonEventEmitter(this.signTransactionSuccess, [otp]);        
        }
      else{
           this.validateTransactionOTP(otp);
      }
      
    },
    FCB_signTransaction(exception,message){
      kony.print("in SCB_SignTransaction:"+exception + " " + message);
    },
   
    validateTransactionOTP : function(otp){
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
      this.commonEventEmitter(this.signTransactionSuccess, [success]);
//       alert(JSON.stringify(success));
    },
   
    validateTransactionOTPFailure : function(error){
      kony.print("ApproveSDK " + JSON.stringify(error));
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