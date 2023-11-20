define([`com/hid/TransactionSigningWithoutUI/transactionSigningBusinessController`], function(transactionSigningBusinessController) {
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
    approveDeleteInitiateFailure: "approveDeleteInitiateFailure"
    
  }
  const getLogTag = function(string){
    return "transactionSigningPresentationController." + string;
  };
  function transactionSigningPresentationController(){

  }
  
  transactionSigningPresentationController.prototype.aprroveDeleteInitiate = function(eventHandler, username, tds,deviceId){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      eventHandler(Events.approveDeleteInitiateSuccess, [{"status" : "success"}]);
      this.approveDeleteStatusPolling(eventHandler,authReqId);
    };
    let Failure_CB = error => {
      eventHandler(Events.approveDeleteInitiateFailure, [error]);
    };
    let params = {
       username,
       tds,
       deviceId
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.aprroveTransactInitiate = function(eventHandler, username, tds,deviceId){
    let Success_CB = success => {
      var authReqId = success.AprroveTransactInitiate[0].auth_req_id;
      eventHandler(Events.approveInitiateSuccess, [{"status" : "success"}]);
      this.approveStatusPolling(eventHandler,authReqId);
    };
    let Failure_CB = error => {
      eventHandler(Events.approveInitiateFailure, [error]);
    };
    let params = {
       username,
       tds
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
 
   transactionSigningPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
     let params = {"username" : username};
     transactionSigningBusinessController.getApproveDevices(params, S_CB, F_CB);
   };
  
  transactionSigningPresentationController.prototype.validateOfflineOTP = function(eventHandler,username,values,OTP){
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
      "content"  : content
    };
    transactionSigningBusinessController.validateOfflineOTP(params, Success_CB,Failure_CB);
  };  
  transactionSigningPresentationController.prototype.generateChallenge = function(eventHandler,username,deviceId=""){
    let Success_CB = success => {
      eventHandler(Events.generateChallengeSuccess, [{"status" : "success", "response": success.GenerateChallenge[0]}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.generateChallengeFailure, [error]);
    };
    let params =  {
      "username" : username,
      "deviceId" : deviceId
    };
    transactionSigningBusinessController.generateChallenge(params, Success_CB,Failure_CB);
  };
transactionSigningPresentationController.prototype.validateChallenge = function(eventHandler,username,OTP){
    let Success_CB = success => {
      eventHandler(Events.generateChallengeSuccess, [{"status" : "success"}]);
    };
    let Failure_CB = error => {
      eventHandler(Events.generateChallengeFailure, [error]);
    };
    let params =  {
      "username" : username,
      "password" : OTP
    };
    transactionSigningBusinessController.validateChallenge(params, Success_CB,Failure_CB);
  };  
  transactionSigningPresentationController.prototype.approveStatusPolling = function(eventHandler, authReqId){
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
    transactionSigningBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };
  
  transactionSigningPresentationController.prototype.approveDeleteStatusPolling = function(eventHandler, authReqId){
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
    transactionSigningBusinessController.approveStatusPolling(params, Success_CB,Failure_CB);  
  };

   transactionSigningPresentationController.prototype.sendSMSOTP = function(eventHandler,username,toAccount,amount,message){
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
      "correlationid" : '1123',
      "Message" : ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with message ${message}` 
    };
    transactionSigningBusinessController.sendSMSOTP(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.validateSMSOTP = function(eventHandler,username,OTP){
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
      "correlationId" : '1123'
    };
    transactionSigningBusinessController.validateSMSOTP(params, Success_CB,Failure_CB);
  }; 
  
  transactionSigningPresentationController.prototype.getServiceURL = function(eventHandler){
    let Success_CB = response => {
      eventHandler(Events.getServiceURLSuccess, [response]);
    };
    let Failure_CB = error => {
      eventHandler(Events.getServiceURLFailure, [error]);
    };
    transactionSigningBusinessController.getServiceURL(Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.getInstance = function() {
    instance = instance === null ? new transactionSigningPresentationController() : instance;
    return instance;
  };
  return transactionSigningPresentationController.getInstance();
});