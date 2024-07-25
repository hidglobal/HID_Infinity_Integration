define(["com/hid/idv/webSubmission/idvBusinessController"], function(idvBusinessController){
    const IDV_Constants = {
       "phoneno": {},
       "email"  : {},
       "qrscan" : {},
    };
    const validLinkChannel = new Set(["phoneNo", "email", "qrScan"]); 
    IDV_Constants.GENERIC_EXCEPTION = "Something went wrong";
    IDV_Constants.POLLING_ALREADY_CALLED = "Polling is already in progress";
    IDV_Constants.ERROR_INVALID_POLLING_OFFSETTIME = "Invalid value given for offset time";
    IDV_Constants.ERROR_INVALID_POLLING_POLLCYCLE = "Invalid value given for poll cycles";
    IDV_Constants.phoneno.INVALID_ERROR = "Invalid phoneNo passed";
    IDV_Constants.email.INVALID_ERROR = "Invalid email passed";
    IDV_Constants.ERROR_INVALID_LINKCHANNEL = "Invalid linkChannel Value";
    const Service_Constants = {
       "submission": {
           "phoneno": {
               "businessMethod": idvBusinessController.sendLinkWithPhoneNo,
                getParams(val){
                     return {
                         "PhoneNumber": val.val,
                         "uid": val.uid,
                     }
                },
                "responseParam": "requestID"
           },
          "email": {
               "businessMethod": idvBusinessController.sendLinkWithEmail,
                getParams(val){
                     return {
                         "email": val.val,
                         "uid " : val.uid,
                     }
                },
                "responseParam": "requestID"
           },
         "qrscan": {
             "businessMethod": idvBusinessController.generateLinkForQRScan,
             getParams(val){
               return {
                 "uid": val.uid
               }
             },
             "responseParam": "requestID",
             "urlParam" : "url"
           },
        },
        "status": {
            "businessMethod": idvBusinessController.getSubmissionStatus,
                getParams(val){
                     return {
                       "Token": val,
//                        "uid " : this.uid,
                     }
                },
                "responseParam" : "transactionId",
                "statusParam" : "requestStatus",
                "inprogressString" : "INPROGRESS"
        },
        "details": {
            "businessMethod": idvBusinessController.getSubmissionDetails,
                getParams([val]){
                     return {
                         "transactionId": val
                     }
                }
        },
       "images": {
            "businessMethod": idvBusinessController.getImages,
                getParams(val){
                     return {
                       "imageName" : val.imageName,
                       "transactionId": val.transactionId
                     }
                },
        },
    }
    const eventMeta = {
       "submission": {
           "success": "startSubmissionSuccess",
           "failure": "startSubmissionFailure"
       },
       "details": {
          "success": "submissionStatusSuccess",
          "failure": "submissionStatusFailure"
       },
      "status": {
        "expiry": "pollTimeExpired"
      },
      "images": {
        "success": "getImagesSuccess",
        "failure": "getImagesFailure"
      }
    }
    function throwCustomerException(errorMsg = IDV_Constants.GENERIC_EXCEPTION){
       throw new Error(errorMsg);
    }
    const inputValidation = {
        "phoneno": function(val){
          var pattern = /^\+\d{1,3}\s?\d{1,14}$/;
          var strippedPhoneNumber =  val.replace(/\s/g, '');
          if (pattern.test(strippedPhoneNumber)) {
            return true;
          } else {
            return false;
          }
        },
      "email": function(val){
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (pattern.test(val)) {
          return true; 
        } else {
          return false; 
        }
      }
    }
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {

    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, 'pollingOffsetTime', () => {
        return this._pollingOffsetTime;
      });
      defineSetter(this, 'pollingOffsetTime', value => {
        if (isNaN(value) || value < 0) {
          throwCustomerException(IDV_Constants.ERROR_INVALID_POLLING_OFFSETTIME);
        }
        this._pollingOffsetTime = value;
      });
      defineGetter(this, 'noOfPollingCycles', () => {
        return this._noOfPollingCycles;
      });
      defineSetter(this, 'noOfPollingCycles', value => {
        if (isNaN(value) || value <= 0) {
          throwCustomerException(IDV_Constants.ERROR_INVALID_POLLING_OFFSETTIME);
        }
        this._noOfPollingCycles = value;
      });
      defineGetter(this, 'linkChannel', () => {
        return this._linkChannel;
      });
      defineSetter(this, 'linkChannel', value => {
        if(!validLinkChannel.has(value)) {
          throwCustomerException(IDV_Constants.ERROR_INVALID_LINKCHANNEL);
        }
        this._linkChannel = value.toLowerCase();
      });
    },
    reqId: "",
    uid: "",
    transactionId: "",
    isPollingStarted: false,
    //Public Method
    startSubmission : function(valJSON){
       let mode = this._linkChannel;
       this.isPollingStarted = false;
       let val = valJSON.val;
       this.uid = valJSON.uid;
       kony.print("UID: "+ this.uid);
        if(val !== null){
           if(!inputValidation[mode].call(this,val)){
              throwCustomerException(IDV_Constants[mode].INVALID_ERROR);
           }
        }
       else{
         this.linkChannel = "qrScan";
         mode = this._linkChannel;
//          valJSON = this.uid;
       }
       this.callService(valJSON,this.startSubmissionSuccessInternal, this.startSubmissionFailureinternal, "submission" , mode);
    },
    
    startSubmissionSuccessInternal(success){
       this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.submission.success, [success])
       const mode = this._linkChannel;
       const reqIdParam = Service_Constants.submission[mode].responseParam;
       const reqId = success[reqIdParam];
       this.reqId = reqId;
       const time = this._pollingOffsetTime *60;
       const timerId = `IDVTimer.${Math.floor(Math.random()*10000)}`;
       kony.timer.schedule(timerId, () => this.startStatusPolling(this._noOfPollingCycles), time, false);
       //this.statusPoller(reqId);
    },
    
    startSubmissionFailureinternal(failure){
        this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.submission.failure,[failure]);
    },
    
    //Public Function
    startStatusPolling: function(pollCycles=5){
        if(this.isPollingStarted){
           throwCustomerException(IDV_Constants.POLLING_ALREADY_CALLED);
           return;
        }
        if(pollCycles <= 0){
          throwCustomerException(IDV_Constants.ERROR_INVALID_POLLING_POLLCYCLE);
          return;
        }
        this.isPollingStarted = true;
        const reqId = this.reqId; 
//         let params = this.uid;
        let params = [reqId];
        kony.print("Params: "+ params);
        pollCycles--;
        const S_CB = (success) => {
           const txID = success[Service_Constants.status.responseParam];
           this.transactionId = txID;
           this.isPollingStarted = false;
           this.getDetails(txID);
        };
        const F_CB = (error) => {
           const param = Service_Constants.status.statusParam;
//          	 this.getDetails("rdidQYrUEdCMPZbn");
           if(pollCycles-- == 0 || error[param] != Service_Constants.status.inprogressString){
              this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.status.expiry, [error])
              this.isPollingStarted = false;
              return;
           }
           recursiveCaller();
        };
        const recursiveCaller = ()=>{
           this.callService(params, S_CB, F_CB, "status");
        }
        recursiveCaller();
    },
    
    
    getDetails(txId){
       this.callService([txId], this.submissionStatusSuccessInternal, this.submissionStatusFailureInternal, "details");
    },
    
    getDocImages: function(imageName){
      let value = {"imageName": imageName, "transactionId": this.transactionId};
      this.callService(value, this.getImagesSuccessInternal, this.getImagesFailureInternal, "images");
    },
    
    getImagesSuccessInternal(success){
       this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.images.success, [success]);
    },
    
    getImagesFailureInternal(failure){
      this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.images.failure, [failure]);  
    },
    
    submissionStatusSuccessInternal(success){
       this.isPollingStarted = false;
       this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.details.success, [success]);
    },
    
    submissionStatusFailureInternal(failure){
       this.isPollingStarted = false;
       this.eventEmitter.emitMandatoryEvent.call(this,eventMeta.details.failure, [failure]);   
    },
    
    eventEmitter: {
       emitMandatoryEvent(event, params){
           if(this[event]){
              this[event].apply(this,params);
           }else{
             throwCustomerException(`${event} is not subscribed`);
           }
       }
    },
    
    callService( params ,S_CB , F_CB , mode, subMode = null){
        let serviceDetails = Service_Constants[mode];
        if(subMode){
          serviceDetails = serviceDetails[subMode];
//           kony.print("Service Details: ", serviceDetails);
        }  	
        const serviceParams = serviceDetails.getParams(params);
        serviceDetails.businessMethod.call(this, serviceParams , S_CB,F_CB); 
    }
  };
});