define([`com/hid/onboarding/OnboardingBusinessController`], function(OnboardingBusinessController) {
  var instance = null;
  var pollCounter = 2;
  const getLogTag = function(string){
    return "OnboardingPresentationController." + string;
  };
  function OnboardingPresentationController(){

  }

  OnboardingPresentationController.prototype.validateActivationCode = function(updateOnboardingUI,username,activationCode,correlationId){
    let Success_CB = success => {
      this.userId =  success.ActivationCodeValidation[0].userid;
      this.auth_key = success.ActivationCodeValidation[0].Auth_Key; // Karthiga changes
      this.username = username;
      let UIObject = {
        "state" : "activationCodeSuccess",
        "response" : success.ActivationCodeValidation[0]
      };
     // updateOnboardingUI(UIObject);
      this.getPasswordPolicy(updateOnboardingUI,correlationId);
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
      "username": username,
     "correlationId": correlationId
    };
    OnboardingBusinessController.validateActivatonCode(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.getPasswordPolicy = function(updateOnboardingUI,correlationId){
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
    OnboardingBusinessController.getPasswordPolicy({"correlationId" : correlationId}, Success_CB,Failure_CB);
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


  OnboardingPresentationController.prototype.addPasswordandMFAtoUser = function(updateOnboardingUI,password,MFA,correlationId){
    let Success_CB = success => {
      switch(MFA){
        case "OTP_SMS":
          this.addOOBToUser(updateOnboardingUI,MFA,correlationId);
          break;
        case "OTP_EML":
          this.addOOBToUser(updateOnboardingUI,MFA,correlationId);
          break;
        case "APPROVE":
          this.approveDeviceRegistration(updateOnboardingUI,correlationId);
          break;
        case "OTP_HWT":
          this.addHWAuthenticatorToUser(updateOnboardingUI,correlationId);
          break;
        default:
          this.approveDeviceRegistration(updateOnboardingUI,correlationId);
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
      "userId": this.userId,
      "Auth_Key": this.auth_key,
      "correlationId": correlationId
    };
    //alert(JSON.stringify(params));
    OnboardingBusinessController.addPasswordtoUser(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.addOOBToUser = function(updateOnboardingUI,authType,correlationId,userId = this.userId){
    var authenticatorType = authType === "OTP_SMS" ? "AT_OOBSMS" : "AT_OOBEML";
    var authenticatorValue =  authType === "OTP_SMS" ? "DT_OOBSMS" : "DT_OOBEML";
    if(authType === "OTP_HWT"){
      authenticatorType = "AT_OTP";
    }
    this.authType = authenticatorType;
    let Success_CB = success => {
      let UIObject = {
        "state" : "addAndSendOOBSuccess",//"addOOBToUserSuccess",
        "response" : {
          "response" : success
        }
      };
      updateOnboardingUI(UIObject);
 //     this.sendOOB(updateOnboardingUI,authenticatorType);
    }; 
    let Failure_CB = error => {
      //       alert(JSON.stringify(error));
      let UIObject = {
        "state" : "addAndSendOOBFailure",//"addOOBToUserFailure",
        "response" : {
          "response" : error
        }
      };
      updateOnboardingUI(UIObject);
    };
    let params = {
      "AuthenticatorType": authenticatorType,
      "userId": userId,
      "username": this.username,
      "AuthenticatorValue": authenticatorValue,
      "Auth_Key": this.auth_key,
      "AuthenticationType": authenticatorType,
      "correlationId" : correlationId
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.addOOBToUser(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.addOOBToUserWithPin = function(updateOnboardingUI,authType,PIN,correlationId,userId = this.userId){
    var authenticatorType = authType === "OTP_SMS" ? "AT_OOBSMS" : "AT_OOBEML";
    var authenticatorValue =  authType === "OTP_SMS" ? "DT_OOBSMS" : "DT_OOBEML";
    this.authType = authenticatorType;
    this.OOBPIN = PIN;
    let Success_CB = success => {
      let UIObject = {
        "state" : "addOOBToUserSuccess",
        "response" : {
          "response" : success
        }
      };
      this.sendOOBWithPIN(updateOnboardingUI,authenticatorType);
    }; 
    let Failure_CB = error => {
            //alert(JSON.stringify(error));
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
      "AuthenticatorValue": authenticatorValue,
      "OOB_PIN" : PIN,
      "isPasswordRequired" : true,
      "correlationId" : correlationId
    };
     // alert(JSON.stringify(params));
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
  
    OnboardingPresentationController.prototype.sendOOBWithPIN = function(updateOnboardingUI,authType = this.authType,username = this.username){

    let Success_CB = success => {
      updateOnboardingUI({"state" : "addAndSendOOBSuccess"});
    };
    let Failure_CB = error => {
      updateOnboardingUI({"state" : "addAndSendOOBFailure"});
    };
    let PIN = this.OOBPIN;
    let params = {
      "AuthenticationType": authType,
      "username": username,
      "isPasswordRequired" : true,
      "password" : PIN
    };
        //alert(JSON.stringify(params));
    OnboardingBusinessController.sendOOB(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.validateOOB = function(updateOnboardingUI, OTP, correlationId, authType = this.authType, username = this.username){
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
      "OTP": OTP,
      "correlationId": correlationId
    };
    //     alert(JSON.stringify(params));
    OnboardingBusinessController.validateOOB(params, Success_CB,Failure_CB);
  };
  OnboardingPresentationController.prototype.approveDeviceRegistration = function(updateOnboardingUI,correlationId,username = this.username,userId = this.userId){
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
      "usernameWithRandomNo": `${username}.${randNo}`,
      "Auth_Key": this.auth_key,
      "correlationId" : correlationId
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
  OnboardingPresentationController.prototype.addHWAuthenticatorToUser = function(updateOnboardingUI,correlationId,authType,userId = this.userId){
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
      "correlationId": correlationId
    };
    OnboardingBusinessController.addHardwareAuthenticator(params, Success_CB,Failure_CB);
  };

  OnboardingPresentationController.prototype.searchHardwareDevice = function(updateOnboardingUI,serialNo,correlationId){
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
      //"correlationId": correlationId
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
      "loop_seperator":"|",
    };
    OnboardingBusinessController.addHardwareDeviceToUser(params, Success_CB,Failure_CB);
  };
  
  function arrayBufferToBase64url(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  
  function generateCredential(updateOnboardingUI, request_uri, publicKey, csrf, username,correlationId) {
    navigator.credentials.create({publicKey})
      .then(pubKeyCred => {
        
      	let credential = {
          type: pubKeyCred.type,
          id: pubKeyCred.id ? pubKeyCred.id : null,
          rawId: arrayBufferToBase64url(pubKeyCred.rawId),
          response: {
            clientDataJSON: arrayBufferToBase64url(pubKeyCred.response.clientDataJSON),
            attestationObject: arrayBufferToBase64url(pubKeyCred.response.attestationObject)
          }
        };
        
        let successCallback = success => {
          updateOnboardingUI({
            "state": "fidoDeviceRegistrationSuccess",
            "response": success
          })
        };
        
        let failureCallback = err => {
          updateOnboardingUI({
            "state": "fidoDeviceRegistrationFailure",
            "response": err
          })
        };
        
        const inpParams = {
          "csrf": csrf,
          "username": username,
          "request_uri": request_uri,
          "id": credential.id,
          "rawId": credential.rawId,
          "clientDataJSON": credential.response.clientDataJSON,
          "attestationObject": credential.response.attestationObject,
          "correlationId" : correlationId
        };
        
        OnboardingBusinessController.registerFidoDevice(inpParams, successCallback, failureCallback);
      })
      .catch(err => {
      	alert(err);
        updateOnboardingUI({
          "state": "fidoDeviceRegistrationFailure",
          "response": err
        })
      });
  }
  
  OnboardingPresentationController.prototype.fidoDeviceRegistration = function(updateOnboardingUI,correlationId, username=this.username) {
    let success_CB = success => {
      const request_uri = success.FIDOOnboarding[0].request_uri;
      const csrf = success.FIDOOnboarding[0]["server-csrf-token"];
      let pubKey = success.FIDOOnboarding[0].publicKeyCredentialOptions[0];
      
      pubKey = {
        challenge: Uint8Array.from(window.atob(pubKey.challenge.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0)),
        rp: {
          id: pubKey.rp[0].id,
          name: "localhost"
        },
        user: {
          id: Uint8Array.from(window.atob(pubKey.user[0].id.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0)),
          name: pubKey.user[0].name,
          displayName: pubKey.user[0].displayName
        },
        authenticatorSelection: pubKey.authenticatorSelection[0],
        pubKeyCredParams: pubKey.pubKeyCredParams
      };
      
      for (p in pubKey.pubKeyCredParams) {
        pubKey.pubKeyCredParams[p].alg = parseInt(pubKey.pubKeyCredParams[p].alg);
      }
      
      generateCredential(updateOnboardingUI, request_uri, pubKey, csrf, username, correlationId);
    };
    
    let failure_CB = err => {
      let uiObject = {
        "state": "fidoDeviceRegistrationFailure",
        "response": err
      };
      
      updateOnboardingUI(uiObject);
    };
    
    let params = {
      "username": username,
      "Auth_Key": this.auth_key,
      "correlationId": correlationId
    };
    
    OnboardingBusinessController.fidoDeviceRegistration(params, success_CB, failure_CB);
  }
 
  OnboardingPresentationController.getInstance = function(){
    instance = instance === null ? new OnboardingPresentationController() : instance;
    return instance;
  };
  return OnboardingPresentationController.getInstance();
});