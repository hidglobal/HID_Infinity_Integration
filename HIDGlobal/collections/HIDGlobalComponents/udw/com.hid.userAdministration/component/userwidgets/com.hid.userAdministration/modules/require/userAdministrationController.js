define([`com/hid/userAdministration/userAdministrationPresentationController`], function(userAdministrationPresentationController) {
  username = "";
  gblTimer  = null;
  var userid;
  
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
    },
    
    login : function(){
      if(this.view.tbxUser.text === ""){
        this.view.lblErrorLogin.text = "Please enter UserID";
        return;
      }
      if(this.view.tbxPassword.text === ""){
        this.view.lblErrorLogin.text = "Please enter Password";
        return;
      }
      this.username = this.view.tbxUser.text;
      this.view.lblErrorLogin.text = "";
      userAdministrationPresentationController.validatePassword(this.username, this.view.tbxPassword.text, this.onValidatePasswordSuccess, this.onValidatePasswordFailure);    
    },  
    onValidatePasswordSuccess : function(response){
      this.view.flxLogin.setVisibility(false);
      this.view.userid.setVisibility(true);
      this.view.btnViewAuth.setVisibility(true);
      this.view.logout.setVisibility(true);
      this.view.forceLayout();
    },
    onValidatePasswordFailure : function(error){
      this.view.lblErrorLogin.text = "UserID or password is invalid";
    },
   
    
    viewAuthenticators:function(){
      if(this.view.textUserId.text === ""){
        this.view.alertMessage.text = "Please enter UserID";
        return;
      }
      this.view.alertMessage.text = "";
      userAdministrationPresentationController.viewAuthenticators(this.view.textUserId.text, this.onViewAuthenticatorsSuccess, this.onViewAuthenticatorsFailure);       
    },
    onViewAuthenticatorsSuccess : function(response){
      this.view.flxDevices.setVisibility(true);
      this.view.forceLayout();
      if(response.LoopDataset.length>0){
        userid = response.userid;
        let dataSet = response.LoopDataset;
        let deviceData = dataSet.map((data,index)=>({
          "authDesc" : data.desc,
          "authType" : {"text" : data.authType, "isVisible" : false},
          "status" : data.status,
          "lastsuccessfullogon" : data.lastSuccessfulDate,
          "lastfailedlogon" : data.lastFailedDate,
          "totalfailedlogons" : data.totalFailed,
          "failurecountandMax" : data.consecutiveFailed+"/"+data.disableThreshold,
          "disableThreshold" : {"text" : data.disableThreshold, "isVisible" : false},
          "resetbutton" :  {"text" : "RESET","enable": data.consecutiveFailed == data.disableThreshold ? true : false,
                            "skin" : data.consecutiveFailed == data.disableThreshold ? "sknActive" : "sknSuspend"},
          "enableOrDisable" : {"text" : data.status === "ENABLED" ? "DISABLE" : "ENABLE"},
        }));       

        let widgetDataMap = {
          "authType" : "authDesc",
          "lblAuthType" : "authType",
          "status" : "status",
          "lastsuccessfullogon" : "lastsuccessfullogon",
          "lastfailedlogon" : "lastfailedlogon",
          "totalfailedlogons" : "totalfailedlogons",
          "failurecountandMax" : "failurecountandMax",
          "disableThreshold" : "disableThreshold",
          "btnReset" : "resetbutton",
          "btnEnbaleDisable" : "enableOrDisable"
        };
        this.view.segAuth.widgetDataMap = widgetDataMap;    
        this.view.segAuth.data = deviceData;  
      }
    },
     onViewAuthenticatorsFailure : function(error){
       this.view.alertMessage.text = "UserID not found";
    },
    enableDisableAuthenticator : function(context){
      var rowData = this.view.segAuth.data[context.row];
      let authType = rowData.authType.text;
      let sts = rowData.enableOrDisable.text == "ENABLE" ? "ENABLED" : "DISABLED";
      let active = sts == "ENABLED" ? true : false;
      userAdministrationPresentationController.enableDisableAuthenticator(active,authType,sts,userid, success => this.onEnableDisableSuccess(success, context.row), this.onEnableDisableFailure);       
    },
    onEnableDisableSuccess : function(response,index){
      for(var property in response) {
        if(property == 'ChangeAuthenticatorStatus'){
          let tempStatus = response[property].map(a => a.status).toString();
          let totalData = this.view.segAuth.data.slice();
          let data = totalData[index];
          data.status =  tempStatus;
          data.enableOrDisable = {"text" : tempStatus === "ENABLED" ? "DISABLE" : "ENABLE",};
          totalData[index] = data;
          this.view.segAuth.setData(totalData);
          this.view.forceLayout();
        }
      }
    },
    onEnableDisableFailure : function(error){
      this.view.alertMessage.text = JSON.stringify(error);
    },
    resetFailureCount : function(context){
      this.view.alertMessage.text = ""
      var rowData = this.view.segAuth.data[context.row];
      let authType = rowData.authType.text;
      userAdministrationPresentationController.resetFailureCount(userid, authType,  success =>this.onResetFailureCountSuccess(success,context.row), failure => this.onResetFailureCountFailure(failure, context.row));       
    },
    onResetFailureCountSuccess : function(response, index){
      let totalData = this.view.segAuth.data.slice();
      let data = totalData[index];
      data.failurecountandMax = "0"+"/"+ data.disableThreshold.text;
      data.resetbutton =  {
        "text" : "RESET", "enable": false ,
        "skin" : "sknSuspend"
      },
        totalData[index] = data;
      this.view.segAuth.setData(totalData);
      this.view.forceLayout();
      this.view.alertMessage.text = "Authenticator reset completed";
    },
    onResetFailureCountFailure : function(error, index){
      for(var property in error) {
        if(property === "errmsg"){
          this.view.alertMessage.text = error[property];
        }  
      }
    },
   
  };
});