define([`com/hid/onboarding/OnboardingBusinessController`], function(OnboardingBusinessController) {
  var instance = null;
  var pollCounter = 2;
  const getLogTag = function(string){
    return "OnboardingPresentationController." + string;
  };
  function OnboardingPresentationController(){

  }

  OnboardingPresentationController.prototype.validateActivationCode = function(updateOnboardingUI,username,activationCode){
    let Success_CB = success => {
      this.userId =  success.ActivationCodeValidation[0].userid;
      this.username = username;
      let UIObject = {
        "state" : "activationCodeSuccess",
        "response" : success.ActivationCodeValidation[0]
      };
     // updateOnboardingUI(UIObject);
      this.getPasswordPolicy(updateOnboardingUI);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "activationCodeFailure",
        "response" : error.ActivationCodeValidation[0]
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "filter": username,
      "activationCode": activationCode,
      "username": username
    };
    OnboardingBusinessController.validateActivatonCode(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.getPasswordPolicy = function(updateOnboardingUI){
    let Success_CB = success => {
      //alert(JSON.stringify(success));
      var userId = this.userId;
      success.PasswordPolicy[0].userid = userId;
      let UIObject = {
        "state" : "activationCodeSuccessWithPasswordPolicy",
        "response" : success.PasswordPolicy[0]
      };
      updateOnboardingUI(UIObject);
    };
    let Failure_CB = error => {
      let UIObject = {
        "state" : "activationCodeSuccess",
        "response" : error.ActivationCodeValidation[0]
      };
      updateOnboardingUI(UIObject);
    };
    OnboardingBusinessController.getPasswordPolicy({}, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.initiateApproveNotification = function(updateOnboardingUI,username=this.username,deviceId=this.deviceId){
    let Success_CB = success => {
      var authReqId = success.HIDApproveInitiation[0].auth_req_id;
      let UIObject = {
        "state" : "approveNotificationSuccess",
        "response" : success
      };
      updateOnboardingUI(UIObject);
      this.approveStatusPolling(updateOnboardingUI,authReqId);
    };
    let Failure_CB = error => {
      //       alert(JSON.stringify(error));
      let UIObject = {
        "state" : "approveNotificationFailure",
        "response" : error
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "username": this.username
    };
    OnboardingBusinessController.initiateApproveNotification(params, Success_CB,Failure_CB);
  };


  OnboardingPresentationController.prototype.addPasswordandMFAtoUser = function(updateOnboardingUI,password,MFA){
    let Success_CB = success => {
      switch(MFA){
        case "OTP_SMS":
          this.addOOBToUser(updateOnboardingUI,MFA);
          break;
        case "OTP_EML":
          this.addOOBToUser(updateOnboardingUI,MFA);
          break;
        case "APPROVE":
          this.approveDeviceRegistration(updateOnboardingUI);
          break;
        case "OTP_HWT":
          this.addHWAuthenticatorToUser(updateOnboardingUI);
          break;
        default:
          this.approveDeviceRegistration(updateOnboardingUI);
      }
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "addPasswordandMFAtoUserFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "username": this.username,
      "password": password,
      "userId": this.userId
    };
    //alert(JSON.stringify(params));
    OnboardingBusinessController.addPasswordtoUser(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.addOOBToUser = function(updateOnboardingUI,authType,userId = this.userId){
    var authenticatorType = authType === "OTP_SMS" ? "AT_OOBSMS" : "AT_OOBEML";
    var authenticatorValue =  authType === "OTP_SMS" ? "DT_OOBSMS" : "DT_OOBEML";
    if(authType === "OTP_HWT"){
      authenticatorType = "AT_OTP";
    }
    this.authType = authenticatorType;
    let Success_CB = success => {
      let UIObject = {
        "state" : "addOOBToUserSuccess",
        "response" : {
          "response" : success
        }
      };
      this.sendOOB(updateOnboardingUI,authenticatorType);
    }; 
    let Failure_CB = error => {
      //       alert(JSON.stringify(error));
      let UIObject = {
        "state" : "addOOBToUserFailure",
        "response" : {
          "response" : error
        }
      };
    };
    let params = {
      "AuthenticatorType": authenticatorType,
      "userId": userId,
      "AuthenticatorValue": authenticatorValue
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.addOOBToUser(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.sendOOB = function(updateOnboardingUI,authType = this.authType,username = this.username){

    let Success_CB = success => {
      updateOnboardingUI({"state" : "addAndSendOOBSuccess"});
    };
    let Failure_CB = error => {
      updateOnboardingUI({"state" : "addAndSendOOBFailure"});
    };
    let params = {
      "AuthenticationType": authType,
      "username": username
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.sendOOB(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.validateOOB = function(updateOnboardingUI, OTP, authType = this.authType, username = this.username){
    let Success_CB = success => {
      let UIObject = {
        "state" : "validateOOBSuccess",
        "response" : {
          "response" : success
        }
      };
      updateOnboardingUI(UIObject);
    }; 

    let Failure_CB = error => {
      let UIObject = {
        "state" : "validateOOBFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };
    //var authenticatorType = authType === "OOB_SMS" ? "AT_OOBSMS" : "AT_OOBEML";
    let params = {
      "AuthenticationType": authType,
      "username": username,
      "OTP": OTP
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.validateOOB(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.approveDeviceRegistration = function(updateOnboardingUI,username = this.username,userId = this.userId){
    let Success_CB = success => {
      let rawString = success.ApproveDeviceRegistration[0].provisionMsg;
      let invCode = `${rawString}`;
      //       alert(invCode);
      var obj = JSON.parse(invCode);
      var inviteCode64 = obj.pss;
      var decodedInvCode = atob(inviteCode64);
      var uid = obj.uid;
      var url = obj.url;
      var did = obj.did;
      this.deviceId = did;
      let UIObject = {
        "state" : "approveDeviceRegistrationSuccess",
        "response" : {
          "username" : uid,
          "inviteCodeString"  : invCode,
          "decodedInvCode" : decodedInvCode,
          "url" : url
        }
      };
      updateOnboardingUI(UIObject);
      pollCounter = 2;
      this.initiateDeviceRegistrationPolling(updateOnboardingUI,did);
    };
    let Failure_CB = error => {
      let UIObject = {
        "state" : "approveDeviceRegistrationFailure",
        "response" : {
          "response":error,
          "message" : "Failed to generate Provision message"
        }
      };
      //       alert(JSON.stringify(error));
    };
    let randNo = Math.floor(Math.random() * 10000);
    let params = {
      "UserId": userId,
      "username": username,
      "usernameWithRandomNo": `${username}.${randNo}`
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.approveDeviceRegistration(params, Success_CB,Failure_CB);
  };

  OnboardingPresentationController.prototype.initiateDeviceRegistrationPolling = function(updateOnboardingUI,did){
    pollCounter--;

    let Success_CB = success => {
      kony.print("initiateDeviceRegistrationPolling: success: "+JSON.stringify(success));
      let UIObject = {
        "state" : "deviceRegistrationPollingSuccess",
        "response" : {
          "response" : success
        }
      };
      updateOnboardingUI(UIObject);
      pollCounter = 2;
    };
    let Failure_CB = error => {
      kony.print("initiateDeviceRegistrationPolling: error: "+JSON.stringify(error));
      if(pollCounter <= 0){
        // throw error message - update Onboarding UI

        let UIObject = {
          "state" : "deviceRegistrationPollingFailure",
          "response" : {
            "response" : error
          }
        };
        updateOnboardingUI(UIObject);
        pollCounter = 2;
      } else{
        this.initiateDeviceRegistrationPolling(updateOnboardingUI,did);
      }
    };

    let params = {
      "deviceId":did
    };
    OnboardingBusinessController.deviceRegistrationPolling(params, Success_CB,Failure_CB);  
  };

  OnboardingPresentationController.prototype.approveStatusPolling = function(updateOnboardingUI,authReqId){
    pollCounter--;
    kony.print("approveStatusPolling - AuthReqId:"+JSON.stringify(authReqId));
    kony.print("pollCounter Value:"+JSON.stringify(pollCounter));
    let Success_CB = success => {
      kony.print("Approve Status Polling Success:"+JSON.stringify(success));

      var authStatus = success.ApproveStatusPolling[0].auth_status;
      if(authStatus == "accept"){
        let UIObject = {
          "state" : "approveStatusPollingSuccess",
          "response" : {
            "message" : "Push notification has been Approved",
          }
        };
        updateOnboardingUI(UIObject);
      }else{
        let UIObject = {
          "state" : "approveStatusPollingFailure",
          "response" : {
            "message" : "Approve Notification has been denied",
          }
        };
        updateOnboardingUI(UIObject);
      }
      pollCounter = 2;
    };
    let Failure_CB = error => {
      kony.print("Approve Status Polling Failure_CB:"+JSON.stringify(error));
      if(pollCounter <= 0){
        // throw error message - update Onboarding UI
        let UIObject = {
          "state" : "approveStatusPollingFailure",
          "response" : {
            "response" : error,
            "message": "Approve notification has been failed"
          }
        };
        updateOnboardingUI(UIObject);
        pollCounter = 2;
      } else{
        this.approveStatusPolling(updateOnboardingUI,authReqId);
      }
      //       alert(JSON.stringify(error));
    };

    let params = {
      "mfa_key":authReqId
    };
    OnboardingBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };
  OnboardingPresentationController.prototype.addHWAuthenticatorToUser = function(updateOnboardingUI,authType,userId = this.userId){
    let Success_CB = success => {
      let UIObject = {
        "state" : "addHWAuthenticatorSuccess",
        "response" : {
          "response" : success
        }
      };
      updateOnboardingUI(UIObject);
    }; 
    let Failure_CB = error => {
      let UIObject = {
        "state" : "addHWAuthenticatorFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "UserId": userId,
    };
    OnboardingBusinessController.addHardwareAuthenticator(params, Success_CB,Failure_CB);
  };

  OnboardingPresentationController.prototype.searchHardwareDevice = function(updateOnboardingUI,serialNo){
    let Success_CB = success => {
      let data = success.LoopDataset[0].resources;
      if(data === undefined){
        let UIObject = {
          "state" : "searchHardwareDeviceFailure"
        };
        updateOnboardingUI(UIObject);
        return;
      }
      let devices = data.map(v => v.id);
      let loop_count = devices.length;
      let deviceId = devices.join('|');
      this.addHardwareDeviceToUser(updateOnboardingUI,deviceId,loop_count); 
      }

    let Failure_CB = error => {
      let UIObject = {
        "state" : "searchHardwareDeviceFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "filterItem": `externalId eq  ${serialNo}*`,
    }
    OnboardingBusinessController.searchHardwareDevice(params, Success_CB,Failure_CB);
  };
  
  OnboardingPresentationController.prototype.addHardwareDeviceToUser = function(updateOnboardingUI, deviceId,loop_count,username = this.username){
    let Success_CB = success => {
      let UIObject = {
        "state" : "addHardwareDeviceToUserSuccess",
        "response" : {
          "response" : success
        }
      };
      updateOnboardingUI(UIObject);
    }; 
    let Failure_CB = error => {
      let UIObject = {
        "state" : "addHardwareDeviceToUserFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };

    let params = {
      "Username": username,
      "DeviceId": deviceId,
      "loop_count":loop_count,
      "loop_seperator":"|"
    };
    OnboardingBusinessController.addHardwareDeviceToUser(params, Success_CB,Failure_CB);
  };
 
  OnboardingPresentationController.getInstance = function(){
    instance = instance === null ? new OnboardingPresentationController() : instance;
    return instance;
  };
  return OnboardingPresentationController.getInstance();
});