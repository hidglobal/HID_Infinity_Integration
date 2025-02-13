define([`com/hid/TransactionSigningWithoutUI/txnSigningBusinessController`], function(txnSigningBusinessController) {
  var instance = null;
  var pollCounter = 2;
  var delPollCounter = 2;
  const Events = {
    approveInitiateSuccess : "approveInitiateSuccess",
    approveInitiateFailure : "approveInitiateFailure",
    approveStatusAccept : "approveStatusAccept",
    approveStatusReject : "approveStatusReject",
    approveStatusFailure : "approveStatusFailure",
    offlineTSSuccess : "offlineTSSuccess",
    offlineTSFailure : "offlineTSFailure",
    generateChallengeSuccess : "generateChallengeSuccess",
    generateChallengeFailure : "generateChallengeFailure",
    validateChallengeSuccess : "validateChallengeSuccess",
    validateChallengeFailure : "validateChallengeFailure",
    sendSMSOTPSuccess : "sendSMSOTPSuccess",
    sendSMSOTPFailure : "sendSMSOTPFailure",
    validateSMSOTPSuccess : "validateSMSOTPSuccess",
    validateSMSOTPFailure : "validateSMSOTPFailure",
    getServiceURLSuccess : "getServiceURLSuccess",
    getServiceURLFailure : "getServiceURLFailure",
    approveDeleteStatusAccept: "approveDeleteStatusAccept",
    approveDeleteStatusReject: "approveDeleteStatusReject",
    approveDeleteInitiateSuccess: "approveDeleteInitiateSuccess",
    approveDeleteInitiateFailure: "approveDeleteInitiateFailure",
    getDeviceSuccess: "getDeviceSuccess",
    getDeviceFailure: "getDeviceFailure"
    
  }
  const getLogTag = function(string){
    return "txnSigningPresentationController." + string;
  };
  function txnSigningPresentationController(){

  }
  
  txnSigningPresentationController.prototype.aprroveDeleteInitiate = function(eventHandler, username, tds,deviceId,correlationId){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      eventHandler(Events.approveDeleteInitiateSuccess, [{"status" : "success"}]);
      this.approveDeleteStatusPolling(eventHandler,authReqId);
    };
    let Failure_CB = error => {
      eventHandler(Events.approveDeleteInitiateFailure, [error]);
    };
    let params = {
       "username": username,
       "tds": tds,
       "deviceId": deviceId,
      "correlationId": correlationId
    };
    txnSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
  
  txnSigningPresentationController.prototype.aprroveTransactInitiate = function(eventHandler, username, tds,deviceId,correlationId){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      eventHandler(Events.approveInitiateSuccess, [{"status" : "success"}]);
      this.approveStatusPolling(eventHandler,authReqId);
    };
    let Failure_CB = error => {
      eventHandler(Events.approveInitiateFailure, [error]);
    };
    let params = {
       "username": username,
       "tds": tds,
       "deviceId": deviceId,   
       "correlationId": correlationId
    };
    txnSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
 
   txnSigningPresentationController.prototype.getApproveDevices = function(params, eventHandler){
   //  let params = {"username" : username};
      let Success_CB = success => {
      eventHandler(Events.getDeviceSuccess, [success]);
    };
    let Failure_CB = error => {
      eventHandler(Events.getDeviceFailure, [error]);
    };
     txnSigningBusinessController.getApproveDevices(params, Success_CB, Failure_CB);
   };
  txnSigningPresentationController.prototype.validateOfflineOTP = function(eventHandler,username,values,OTP,correlationId){
    let Success_CB = success => {
      eventHandler(Events.offlineTSSuccess, [{"status" : "success"}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.offlineTSFailure, [error]);
    };
    let tempArr = [];
      for(let i=0;i<values.length;i++){
        let temp = `sign${i+1}:${values[i]}:false`;
        tempArr[i] = temp;
      }
    //Content desired output `sign1:${toAccount}:false sign2:${amount}:false sign3:${desc}:false`
     let content = tempArr.join(" ");
    let params =  {
      "username" : username,
      "password" : OTP,
      "content"  : content,
      "correlationId" : correlationId
    };
    txnSigningBusinessController.validateOfflineOTP(params, Success_CB,Failure_CB);
  };  
  txnSigningPresentationController.prototype.generateChallenge = function(eventHandler,username,correlationId,deviceId=""){
    let Success_CB = success => {
      eventHandler(Events.generateChallengeSuccess, [{"status" : "success", "response": success.GenerateChallenge[0]}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.generateChallengeFailure, [error]);
    };
    let params =  {
      "username" : username,
      "deviceId" : deviceId,
      "correlationId" : correlationId
    };
    txnSigningBusinessController.generateChallenge(params, Success_CB,Failure_CB);
  };
txnSigningPresentationController.prototype.validateChallenge = function(eventHandler,username,OTP,correlationId){
    let Success_CB = success => {
      eventHandler(Events.generateChallengeSuccess, [{"status" : "success"}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.generateChallengeFailure, [error]);
    };
    let params =  {
      "username" : username,
      "password" : OTP,
      "correlationId" : correlationId
    };
    txnSigningBusinessController.validateChallenge(params, Success_CB,Failure_CB);
  };  
  txnSigningPresentationController.prototype.approveStatusPolling = function(eventHandler, authReqId){
    pollCounter--;
    let Success_CB = success => {
      var authStatus = success.ApproveStatus[0].auth_status;
      if(authStatus === "accept"){
         eventHandler(Events.approveStatusAccept, [{"status":"accept"}]);
      }else{
         eventHandler(Events.approveStatusReject,[{"status" : "reject"}]);
      }
      pollCounter = 2;
    };
    let Failure_CB = error => {
      if(pollCounter <= 0){
        pollCounter = 2;
        eventHandler(Events.approveStatusFailure, [error]);
      }else{
        this.approveStatusPolling(eventHandler, authReqId);
      }
    };

    let params = {
      "mfa_key":authReqId
    };
    txnSigningBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };
  
  txnSigningPresentationController.prototype.approveDeleteStatusPolling = function(eventHandler, authReqId){
    delPollCounter--;
    let Success_CB = success => {
      var authStatus = success.ApproveStatus[0].auth_status;
      if(authStatus === "accept"){
          delPollCounter = 2;
          eventHandler(Events.approveDeleteStatusAccept, [{"status":"accept"}]);
			}
      else{
          delPollCounter = 2;
          eventHandler(Events.approveDeleteStatusReject,[{"status" : "reject"}]);
			}
        };
    
    let Failure_CB = error => {
      if(delPollCounter  <= 0){
        delPollCounter = 2;
        eventHandler(Events.approveDeleteStatusReject, [{"status": "Timer-reject"}]);
      }else{
        this.approveDeleteStatusPolling(eventHandler, authReqId);
      }
    };

    let params = {
      "mfa_key":authReqId
    };
    txnSigningBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };

   txnSigningPresentationController.prototype.sendSMSOTP = function(eventHandler,username,toAccount,amount,message,correlationId){
    let Success_CB = success => {

      var txid = success.attributes.filter(v => v.name === "CHALLENGE.ID");
      eventHandler(Events.sendSMSOTPSuccess, [{"status" : "success"}]);
      let transactionid = txid[0].value;
      this.transactionid=transactionid;
    };
    let Failure_CB = error => {
      eventHandler(Events.sendSMSOTPFailure, [error]);
    };
    let params =  {
      "ExternalUserId" : username,
      "correlationId" : correlationId,
      "Message" : ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with message ${message}` 
    };
    txnSigningBusinessController.sendSMSOTP(params, Success_CB,Failure_CB);
  };
  
  txnSigningPresentationController.prototype.validateSMSOTP = function(eventHandler,username,OTP,correlationId){
    let Success_CB = success => {
      eventHandler(Events.validateSMSOTPSuccess, [{"status" : "success"}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.validateSMSOTPFailure, [error]);
    };
    let txId = this.transactionid;
    let params =  {
      "username" : username,
      "password" : OTP,
      "txId" : txId,
      "correlationId" : correlationId
    };
    txnSigningBusinessController.validateSMSOTP(params, Success_CB,Failure_CB);
  }; 
  
  txnSigningPresentationController.prototype.getServiceURL = function(eventHandler){
    let Success_CB = response => {
      eventHandler(Events.getServiceURLSuccess, [response]);
    };
    let Failure_CB = error => {
      eventHandler(Events.getServiceURLFailure, [error]);
    };
    txnSigningBusinessController.getServiceURL(Success_CB,Failure_CB);
  };

  txnSigningPresentationController.prototype.getClientAppProperties = function(){
      txnSigningBusinessController.getClientAppProperties();
  };
  
  txnSigningPresentationController.getInstance = function() {
    instance = instance === null ? new txnSigningPresentationController() : instance;
    return instance;
  };
  return txnSigningPresentationController.getInstance();
});