define([`com/hid/transactionSigning/transactionSigningBusinessController`], function(transactionSigningBusinessController) {
  var instance = null;
  var pollCounter = 2;
  const getLogTag = function(string){
    return "transactionSigningPresentationController." + string;
  };
  function transactionSigningPresentationController(){

  }
  
  
  
    transactionSigningPresentationController.prototype.aprroveTransact_Initiate = function(updateTSUI,username,tds){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      let UIObject = {
        "state" : "approveTransactInitiateSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
      this.approveStatusPolling(updateTSUI,authReqId);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "approveTransactInitiateFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };

    let params = {
      	"username": username,
		"tds": ` ${tds}`
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.aprroveTransactInitiate = function(updateTSUI,username,deviceId,toAccount,amount,desc){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      let UIObject = {
        "state" : "approveTransactInitiateSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
      this.approveStatusPolling(updateTSUI,authReqId);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "approveTransactInitiateFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };

    let params = {
      "username": username,
      "deviceId": deviceId,
      "tds": ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with description ${desc}`
     
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
 
  transactionSigningPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
    let params = {"username" : username};
    transactionSigningBusinessController.getApproveDevices(params, S_CB, F_CB);
  };
  
  transactionSigningPresentationController.prototype.OfflineTS = function(updateTSUI,username,toAccount,amount,desc,OTP){
    let Success_CB = success => {
      //alert(JSON.stringify(success));
      let UIObject = {
        "state" : "offlineTSSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "offlineTSFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };
    let params =  {
      "username" : username,
      "password" : OTP,
      "content"  : `sign1:${toAccount}:false sign2:${amount}:false sign3:${desc}:false`
    };
    transactionSigningBusinessController.OfflineTS(params, Success_CB,Failure_CB);
  };  
  transactionSigningPresentationController.prototype.generateChallenge = function(updateTSUI,username,deviceId=""){
    let Success_CB = success => {
      //alert(JSON.stringify(success));
      let UIObject = {
        "state" : "generateChallengeSuccess",
        "response" : success.GenerateChallenge[0]
      };
      updateTSUI(UIObject);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "generateChallengeFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };
    let params =  {
      "username" : username,
      "deviceId" : deviceId
    };
    transactionSigningBusinessController.generateChallenge(params, Success_CB,Failure_CB);
  };
transactionSigningPresentationController.prototype.validateChallenge = function(updateTSUI,username,OTP){
    let Success_CB = success => {
    //  alert(JSON.stringify(success));
      let UIObject = {
        "state" : "validateChallengeSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
    };
    let Failure_CB = error => {
      //alert(JSON.stringify(error));
      let UIObject = {
        "state" : "validateChallengeFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };
    let params =  {
      "username" : username,
      "password" : OTP
    };
    transactionSigningBusinessController.validateChallenge(params, Success_CB,Failure_CB);
  };  
  transactionSigningPresentationController.prototype.approveStatusPolling = function(updateTSUI,authReqId){
    pollCounter--;
    kony.print("approveStatusPolling - AuthReqId:"+JSON.stringify(authReqId));
    kony.print("pollCounter Value:"+JSON.stringify(pollCounter));
    let Success_CB = success => {
      //alert("Approve Status Polling Success:"+JSON.stringify(success));

      var authStatus = success.ApproveStatus[0].auth_status;
      if(authStatus == "accept"){
        let UIObject = {
          "state" : "approveSuccess",
          "response" : {
            "message" : "Push notification has been Approved",
          }
        };
        updateTSUI(UIObject);
      }else{
        let UIObject = {
          "state" : "approveDenied",
          "response" : {
            "message" : "Approve Notification has been denied",
          }
        };
        updateTSUI(UIObject);
      }
      pollCounter = 2;
    };
    let Failure_CB = error => {
      //alert("Approve Status Polling Failure_CB:"+JSON.stringify(error));
      if(pollCounter <= 0){
        // throw error message - update Onboarding UI
        let UIObject = {
          "state" : "approveTimeOut",
          "response" : {
            "response" : error,
            "message": "Approve notification has been failed"
          }
        };
        updateTSUI(UIObject);
        pollCounter = 2;
      } else{
        this.approveStatusPolling(updateTSUI,authReqId);
      }
      //       alert(JSON.stringify(error));
    };

    let params = {
      "mfa_key":authReqId
    };
    transactionSigningBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };

   transactionSigningPresentationController.prototype.sendSMSOTP = function(updateTSUI,username,toAccount,amount,message){
    let Success_CB = success => {

      var txid = success.attributes.filter(v => v.name === "CHALLENGE.ID");
      let transactionid = txid[0].value;
      this.transactionid=transactionid;
      
      let UIObject = {
        "state" : "sendSMSOTPSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
    };
    let Failure_CB = error => {
      let UIObject = {
        "state" : "sendSMSOTPFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };
    let params =  {
      "ExternalUserId" : username,
      "correlationid" : '1123',
      "Message" : ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with message ${message}` 
    };
    transactionSigningBusinessController.sendSMSOTP(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.validateSMSOTP = function(updateTSUI,username,OTP){
    let Success_CB = success => {
      let UIObject = {
        "state" : "validateSMSOTPSuccess",
        "response" : success
      };
      updateTSUI(UIObject);
    };
    let Failure_CB = error => {
      let UIObject = {
        "state" : "validateSMSOTPFailure",
        "response" : error
      };
      updateTSUI(UIObject);
    };
    let txId = this.transactionid;
    let params =  {
      "username" : username,
      "password" : OTP,
      "txId" : txId,
      "correlationId" : '1123'
    };
    transactionSigningBusinessController.validateSMSOTP(params, Success_CB,Failure_CB);
  };  
  
  transactionSigningPresentationController.getInstance = function() {
    instance = instance === null ? new transactionSigningPresentationController() : instance;
    return instance;
  };
  return transactionSigningPresentationController.getInstance();
});