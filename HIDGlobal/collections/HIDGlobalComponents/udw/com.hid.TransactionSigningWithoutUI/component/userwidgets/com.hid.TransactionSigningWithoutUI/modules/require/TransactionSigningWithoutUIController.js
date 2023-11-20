define([`com/hid/TransactionSigningWithoutUI/transactionSigningPresentationController`],function(transactionSigningPresentationController) {
  const transactionSigningConstants = {};
  transactionSigningConstants.UNREGISTERED_EVENT = `HID Internal Error, Unregistered Event`;
  transactionSigningConstants.INVALID_USERNAME = `Username is Invalid`;
  transactionSigningConstants.INVALID_TDS = `TDS message is Invalid`;
  transactionSigningConstants.INVALID_ACCOUNT = `Account is Invalid`;
  transactionSigningConstants.INVALID_AMOUNT = `Amount is Invalid`;
  transactionSigningConstants.INVALID_DESC = `Description is Invalid`;
  transactionSigningConstants.INVALID_OTP = `OTP is Invalid`;
  transactionSigningConstants.INVALID_SIGN_CONTENT = `Contents for transaction is Invalid`;
  
  const throwCustomException = function(msg){
    throw {
      "type": "HID CUSTOM ERROR",
      "message": msg
    };
  };
  const EventEmitter = {
      mandatoryEvent : {
        emit : function(event, eventName, args){
            if(!event){
              throwCustomException(`Configuration Error, ${eventName} is not subscribed`);
              return;
            }
            event.apply(this, args);
        }
      },
      optionalEvent : {
        emit : function(event, eventName,args){
           if(event){
             event.apply(this,args);
           }
        }
      }
  };
     
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {

    },
    initGettersSetters: function() {
      
    },
    commonEventHandler(eventName, args, isOptional = false){
        let eventEmitter = isOptional ? EventEmitter.optionalEvent : EventEmitter.mandatoryEvent;
        switch(eventName){
          case "approveInitiateSuccess" : 
            eventEmitter.emit(this.approveInitiateSuccess, eventName, args);
            return;
          case "approveInitiateFailure" : 
            eventEmitter.emit(this.approveInitiateFailure,eventName,args);
            return
          case "approveStatusAccept" : 
            eventEmitter.emit(this.approveStatusAccept, eventName, args);
            return;
          case "approveStatusReject" : 
            eventEmitter.emit(this.approveStatusReject, eventName, args);
            return;
          case "approveStatusFailure" :
            eventEmitter.emit(this.approveStatusFailure, eventName, args);
            return;
          case "offlineTSSuccess" :
            eventEmitter.emit(this.offlineTSSuccess, eventName, args);
            return;
          case "offlineTSFailure" :
            eventEmitter.emit(this.offlineTSFailure, eventName, args);
            return;
          case "generateChallengeSuccess" :
            eventEmitter.emit(this.generateChallengeSuccess, eventName, args);
            return;
          case "generateChallengeFailure" :
            eventEmitter.emit(this.generateChallengeFailure, eventName, args);
            return;
          case "validateChallengeSuccess" :
            eventEmitter.emit(this.validateChallengeSuccess, eventName, args);
            return;
          case "validateChallengeFailure" :
            eventEmitter.emit(this.validateChallengeFailure, eventName, args);
            return;
          case "sendSMSOTPSuccess" :
            eventEmitter.emit(this.sendSMSOTPSuccess, eventName, args);
            return;
          case "sendSMSOTPFailure" :
            eventEmitter.emit(this.sendSMSOTPFailure, eventName, args);
            return;
          case "validateSMSOTPSuccess" :
            eventEmitter.emit(this.validateSMSOTPSuccess, eventName, args);
            return;
          case "validateSMSOTPFailure" :
            eventEmitter.emit(this.validateSMSOTPFailure, eventName, args);
            return;
          case "getServiceURLSuccess" :
            eventEmitter.emit(this.getServiceURLSuccess, eventName, args);
            return;
          case "getServiceURLFailure" :
            eventEmitter.emit(this.getServiceURLFailure, eventName, args);
            return;
          case "approveDeleteStatusAccept" :
            eventEmitter.emit(this.approveDeleteStatusAccept, eventName, args);
            return;
          case "approveDeleteStatusReject" :
            eventEmitter.emit(this.approveDeleteStatusReject, eventName, args);
            return;
          case "approveDeleteInitiateSuccess" :
            eventEmitter.emit(this.approveDeleteInitiateSuccess, eventName, args);
            return;
          case "approveDeleteInitiateFailure" :
            eventEmitter.emit(this.approveDeleteInitiateFailure, eventName, args);
            return;
          default :
            throwCustomException(transactionSigningConstants.UNREGISTERED_EVENT);
        }
    },
    
    //public function
    approveDeleteInitiate : function(username, tds, deviceId){
       if(username === null){
         throwCustomException(transactionSigningConstants.INVALID_USERNAME);
       }
       if(tds === null){
         throwCustomException(transactionSigningConstants.INVALID_TDS);
       }
       transactionSigningPresentationController.aprroveDeleteInitiate(this.commonEventHandler,username,tds,deviceId);
    },
    
    //public function
    approveInitiate : function(username, tds, deviceId = undefined){
       if(username === null){
         throwCustomException(transactionSigningConstants.INVALID_USERNAME);
       }
       if(tds === null){
         throwCustomException(transactionSigningConstants.INVALID_TDS);
       }
       transactionSigningPresentationController.aprroveTransactInitiate(this.commonEventHandler,username,tds,deviceId);
    },
    
    validateOfflineOTP : function(username,signContent,OTP){
      if(username === null){
        throwCustomException(transactionSigningConstants.INVALID_USERNAME);
      }      
      if(signContent === [] || signContent === undefined){
        throwCustomException(transactionSigningConstants.INVALID_SIGN_CONTENT);
      }
      if(OTP === "" || isNaN(OTP)){
        throwCustomException(transactionSigningConstants.INVALID_OTP);
      }
      transactionSigningPresentationController.validateOfflineOTP(this.commonEventHandler,username,signContent,OTP);
    },
    
    generateChallenge : function(username,toAccount,amount,desc){
      if(username === null){
        throwCustomException(transactionSigningConstants.INVALID_USERNAME);
      } 
      if(toAccount === "" || isNaN(toAccount)){
        throwCustomException(transactionSigningConstants.INVALID_ACCOUNT);
      }
      if(amount === "" || isNaN(amount) || amount === undefined ){
        throwCustomException(transactionSigningConstants.INVALID_AMOUNT);
      }      
      if(desc === "" || desc === undefined){
        throwCustomException(transactionSigningConstants.INVALID_DESC);
      }
      transactionSigningPresentationController.generateChallenge(this.commonEventHandler,username);
    },
    
    validateChallenge : function(username,OTP){
      if(username === null){
        throwCustomException(transactionSigningConstants.INVALID_USERNAME);
      }
      if(OTP === "" || isNaN(OTP)){
        throwCustomException(transactionSigningConstants.INVALID_OTP);
      }
      transactionSigningPresentationController.validateChallenge(this.commonEventHandler,username,OTP);
    },
   
    sendSMSOTP : function(username,toAccount,amount,desc){
      if(username === null){
        throwCustomException(transactionSigningConstants.INVALID_USERNAME);
      } 
      if(toAccount === "" || isNaN(toAccount)){
        throwCustomException(transactionSigningConstants.INVALID_ACCOUNT);
      }
      if(amount === "" || isNaN(amount) || amount === undefined ){
        throwCustomException(transactionSigningConstants.INVALID_AMOUNT);
      }      
      if(desc === "" || desc === undefined){
        throwCustomException(transactionSigningConstants.INVALID_DESC);
      }      
      transactionSigningPresentationController.sendSMSOTP(this.commonEventHandler,username,toAccount,amount,desc);      
    },
    validateOTP : function(username,OTP){
      if(username === null){
        throwCustomException(transactionSigningConstants.INVALID_USERNAME);
      }
      if(OTP === "" || isNaN(OTP)){
        throwCustomException(transactionSigningConstants.INVALID_OTP);
      }
      transactionSigningPresentationController.validateSMSOTP(this.commonEventHandler,username,OTP);
    },
    generateQRDataForHIDApprove : function(serviceURL,account,amount,remarks,user){      
      //Below is the format to scan the QR code from HIDApproveApp
       //Please note that domain and serviceURL need to be update as per your environment.
       //Also note tag 5,6,&7 can be replaced as per configuration json id for amount, accoun and remarks
       //`ocra://S:${serviceURL}\\${domain}&${user};5:${account};6:${amount};7:${remarks};;`
      
      // Here serviceURL is combination of ${serviceURL}\\${domain}
      // Where serviceURL = HOST from server properties and
      // domain = TENANT from server properties.
      
      let qrData = `ocra://S:${serviceURL}&${user};5:${account};6:${amount};7:${remarks};;`
      return qrData;
    },
    generateQRDataForSDK : function(account,amount,remarks,user){
      let qrData = {
        "username" : this.user, 
        "data": [account,amount,remarks]
      }
      return JSON.stringify(qrData);
    },
    getServiceURL : function(){
      transactionSigningPresentationController.getServiceURL(this.commonEventHandler);
    }
  };
});