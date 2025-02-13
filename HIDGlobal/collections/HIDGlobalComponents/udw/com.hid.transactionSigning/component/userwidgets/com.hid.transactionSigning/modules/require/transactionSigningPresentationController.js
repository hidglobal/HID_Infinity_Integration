define([`com/hid/transactionSigning/transactionSigningBusinessController`], function(transactionSigningBusinessController) {
  var instance = null;
  var pollCounter = 2;
  var host = "";
  var domain = "";
  var serviceURL = "";
  const getLogTag = function(string){
    return "transactionSigningPresentationController." + string;
  };
  function transactionSigningPresentationController(){

  }
  
  
  
    transactionSigningPresentationController.prototype.aprroveTransact_Initiate = function(updateTSUI,username,tds,correlationId){
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
		"tds": ` ${tds}`,
        "correlationId": correlationId
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.aprroveTransactInitiate = function(updateTSUI,username,deviceId,toAccount,amount,desc,correlationId){
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
      "tds": ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with description ${desc}`,
      "correlationId": correlationId
     
    };
    transactionSigningBusinessController.approveTransactInitiate(params, Success_CB,Failure_CB);
  };
 
  transactionSigningPresentationController.prototype.getApproveDevices = function(username, S_CB, F_CB){
    let params = {"username" : username};
    transactionSigningBusinessController.getApproveDevices(params, S_CB, F_CB);
  };
  
  transactionSigningPresentationController.prototype.OfflineTS = function(updateTSUI,username,toAccount,amount,desc,OTP,correlationId){
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
      "content"  : `sign1:${toAccount}:false sign2:${amount}:false sign3:${desc}:false`,
      "correlationId" : correlationId
    };
    transactionSigningBusinessController.OfflineTS(params, Success_CB,Failure_CB);
  };  
  transactionSigningPresentationController.prototype.generateChallenge = function(updateTSUI,username,correlationId,deviceId=""){
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
      "deviceId" : deviceId,
      "correlationId": correlationId
    };
    transactionSigningBusinessController.generateChallenge(params, Success_CB,Failure_CB);
  };
transactionSigningPresentationController.prototype.validateChallenge = function(updateTSUI,username,OTP,correlationId){
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
      "password" : OTP,
      "correlationId" : correlationId
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

   transactionSigningPresentationController.prototype.sendSMSOTP = function(updateTSUI,username,toAccount,amount,message,correlationId){
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
      "correlationId": correlationId,
      "Message" : ` You are about to perform the below transaction to ${toAccount} of amount ${amount} with message ${message}` 
    };
    transactionSigningBusinessController.sendSMSOTP(params, Success_CB,Failure_CB);
  };
  
  transactionSigningPresentationController.prototype.validateSMSOTP = function(updateTSUI,username,OTP,correlationId){
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
      "correlationId": correlationId
    };
    transactionSigningBusinessController.validateSMSOTP(params, Success_CB,Failure_CB);
  };
  transactionSigningPresentationController.prototype.getServiceURL = function(){ 
    transactionSigningBusinessController.getServiceURL(this.getServiceURLSuccess,this.getServiceURLFailure); 
  };

  transactionSigningPresentationController.prototype.getServiceURLSuccess = function(response){
    host = response.host;
    domain = response.tenant;
    serviceURL = `${host}\\\\${domain}`;
  };

  transactionSigningPresentationController.prototype.getServiceURLFailure = function(error){
    kony.print("HID: GetHostAndDomain error: " + JSON.stringify(error));
  };

  transactionSigningPresentationController.prototype.generateQRDataForHIDApprove = function(account,amount,remarks,user){     
     let qrData = `ocra://S:${serviceURL}&${user};5:${account};6:${amount};7:${remarks};;`
     return qrData;
    },
   transactionSigningPresentationController.prototype.getClientAppProperties = function(){     
     transactionSigningBusinessController.getClientAppProperties();
    },  
  
  transactionSigningPresentationController.getInstance = function() {
    instance = instance === null ? new transactionSigningPresentationController() : instance;
    return instance;
  };
  return transactionSigningPresentationController.getInstance();
});