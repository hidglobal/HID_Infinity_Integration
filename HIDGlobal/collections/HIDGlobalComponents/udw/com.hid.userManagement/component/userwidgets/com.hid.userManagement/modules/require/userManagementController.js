define([`com/hid/userManagement/UserManagementPresentationController`], function(UserManagementPresentationController) {
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
      this.view.segmentDevices.data = [];
      this.view.tabSelfService.txtUserIdValue.setEnabled(false);
      this.view.tabSelfService.txtInviteCodeValue.setEnabled(false);
      this.view.tabSelfService.txtServiceUrlValue.setEnabled(false);      
    },

    initGettersSetters: function() {
      defineGetter(this, "Username", function() {
        return this._username;
      });
      defineSetter(this, "Username", function(val) {
        if(val === undefined || null){
          throw {
            "type": "CUSTOM",
            "message": "Username needs to be set"
          };
        }
        this._username = val;
      });
    },
    policy : "",
    sessionId : "",
	actionType :"",
    loadUserManagement : function(sessionId){
      this.sessionId = sessionId;
      this.commonEventHandler(this.showLoading, "");
      this.getPasswordPolicy(this.getUserDevices);
    },

    getUserDevices : function(){     
      UserManagementPresentationController.getDevicesForUser(this._username, this.getDevicesSuccess, this.getDevicesFailure);
    },

    getDevicesSuccess : function(response){      
      if(response.SearchDevices.length>0){
        let dataSet = response.SearchDevices;
        let deviceData = dataSet.map((data,index)=>({
          "friendlyName" : {"text" : data.friendlyName, "enable" : false},
          "deviceId" : data.deviceId,
          "status1" :  {"isVisible" : data.active},
          "status2" : {"isVisible" : !data.active},
          "validFrom" : data.startDate.substring(0,10),
          "validTo" : data.expiryDate.substring(0,10),
          "changeStatus" : {
            "text" : data.active ? "SUSPEND" : "ACTIVE",
            "skin" : data.active ? "sknSuspend" : "sknActive"},
          "edit" : {"isVisible" : true},
          "imgOk" : {"isVisible" : false},
          "imgCancel" : {"isVisible" : false},
          "imgDeleteDevice" : {"isVisible": true}
        }));       

        let widgetDataMap = {
          "txtDeviceName" : "friendlyName",
          "lblDeviceId" : "deviceId",
          "imgActive" : "status1",
          "imgSuspend" : "status2",
          "lblValidFromValue" : "validFrom",
          "lblValidToValue" : "validTo",
          "btnChangeStatus" : "changeStatus",
          "Edit" : "edit",
          "imgOk" : "imgOk",
          "imgCancel" : "imgCancel",
          "imgDeleteDevice": "imgDeleteDevice"
        };
        this.view.segmentDevices.widgetDataMap = widgetDataMap;         
        this.view.segmentDevices.data = deviceData;        
      }      
       this.commonEventHandler(this.dismissLoading, "");
    },

    getDevicesFailure : function(error){
      alert("Failed to get the list of devices");
       this.commonEventHandler(this.dismissLoading, "");
    },

    editTouchEnd : function(context){
      var rowData = this.view.segmentDevices.data[context.row];
      this.friendlyName = rowData.friendlyName.text;
      rowData.friendlyName = {"text" : this.friendlyName, "enable" : true};
      rowData.edit = {"isVisible" : false};
      rowData.imgOk = {"isVisible" : true};
      rowData.imgCancel = {"isVisible" : true};
      this.view.segmentDevices.setDataAt(rowData, context.row, context.section);      
    },

    cancelEdit:  function(context){
      var rowData = this.view.segmentDevices.data[context.row];      
      rowData.friendlyName = {"text" : this.friendlyName, "enable" : false};
      rowData.edit = {"isVisible" : true};
      rowData.imgOk = {"isVisible" : false};
      rowData.imgCancel = {"isVisible" : false};
      this.view.segmentDevices.setDataAt(rowData, context.row, context.section);
    },
    
    deletedeviceButtonClick: function(context){
		if (this.view.segmentDevices.data.length === 1){
          EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Delete Device Failed, Only One Device left!"]);

        }
		else{
            var rowData = this.view.segmentDevices.data[context.row];
            this.commonEventHandler(this.showLoading, "");
            this.actionType = "Delete_Device";
            this.view.nonFinancialComponent.rmsDeleteStatus = status => {
              this.commonEventHandler(this.dismissLoading, "");
              if (status.status === "USER-BLOCK"){
                alert("Cannot delete device User Blocked");
                }
              else if (status.status === "STEP-DOWN"){
                this.unassignDevice(rowData.deviceId);
                }
              else{
                var mapData = this.view.segmentDevices.data;
                var listData = [];
                for (let data = 0; data < mapData.length ; data++){
                    if (mapData[data].deviceId !== rowData.deviceId){
                        if (mapData[data].status1.isVisible === true){
                            listData.push(mapData[data]);
                            }
                        }
                    }
                if (listData.length === 0){
                    EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["No Active Device To Send Approve Notification"]);
                    }
                else{
                    var rowDataObject = {deviceId : rowData.deviceId};
                    listData.unshift(rowDataObject);
                    EventEmitter.mandatoryEvent.emit(this.setDevice, "setDevice", [listData]);
                    }
                }

            };
            this.view.nonFinancialComponent.analyzeAction(this._username,this.actionType,this.sessionId);
        }
    },
    
    //Public Method
    unassignDevice: function(deviceId){
      this.commonEventHandler(this.showLoading, "");
      UserManagementPresentationController.unassignDevice(deviceId,"SUSPENDED","",
                                                         success => this.unassignDeviceSuccess(deviceId,success),
                                                         error => this.unassignDeviceError(error)
                                                         );
      
    },
    
    unassignDeviceSuccess: function(deviceId,response){
      this.deleteDevice(deviceId);
    },
    
    unassignDeviceError: function(error){
      this.commonEventHandler(this.dismissLoading, "");
      EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Delete Device Failed, Something Went Wrong!!"]);

    },
    
    assignDevice: function(deviceId){
      UserManagementPresentationController.assignDevice(deviceId,"ACTIVE",this._username,
                                                        success => {this.commonEventHandler(this.dismissLoading, "");
                                                                    },
                                                        error => {this.commonEventHandler(this.dismissLoading, "");
                                                                   alert(JSON.stringify(error));
                                                                 }
                                                         );
      
    },
    
    
    deleteDevice : function(deviceId){
      UserManagementPresentationController.deleteDevice(deviceId,
                                                        success => this.deleteDeviceSuccess(success), 
                                                        error =>  this.deleteDeviceError(deviceId,error)
                                                        );
      
    },
    
    deleteDeviceSuccess : function(response){
      this.getUserDevices();
      EventEmitter.mandatoryEvent.emit(this.deleteSuccess, "deleteSuccess", []);
    },
    
    deleteDeviceError : function(deviceId,response){
      this.assignDevice(deviceId);
      EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Can not Delete Device, Something went wrong!"]);
    },

    editFriendlyName : function(context){
      this.commonEventHandler(this.showLoading, "");
      let rowData = this.view.segmentDevices.data[context.row];
      let newfriendlyName = rowData.friendlyName.text;
      this.actionType = "device_rename";
      this.view.nonFinancialComponent.stepUpRequired = status => { this.view.flxNonFinancialComponent.setVisibility(true);
                                                                  this.commonEventHandler(this.dismissLoading, "");};
      this.view.nonFinancialComponent.analyzeActionSuccess = status => {this.view.flxNonFinancialComponent.setVisibility(false);
      UserManagementPresentationController.updateFriendlyName(rowData.deviceId, newfriendlyName, 
                                                              success =>this.editFriendlyNameSuccess(context, success), 
                                                              error => { alert("Failed to update device friendly name");
                                                                        this.commonEventHandler(this.dismissLoading, "");}
                                                             );};
      this.view.nonFinancialComponent.analyzeActionFailure = status =>{ this.view.flxNonFinancialComponent.setVisibility(false);
      rowData = this.view.segmentDevices.data[context.row];      
      rowData.friendlyName = {"text" : this.friendlyName, "enable" : false};
      rowData.edit = {"isVisible" : true};
      rowData.imgOk = {"isVisible" : false};
      rowData.imgCancel = {"isVisible" : false};
      this.view.segmentDevices.setDataAt(rowData, context.row, context.section);
      this.commonEventHandler(this.dismissLoading, "");
      alert(status);};
      this.view.nonFinancialComponent.analyzeAction(this._username,this.actionType,this.sessionId);
    },

    editFriendlyNameSuccess : function(context, response){
      let rowData = this.view.segmentDevices.data[context.row];
      rowData.friendlyName = {"text" : response.UpdateDeviceName[0].friendlyName, "enable" : false};
      rowData.edit = {"isVisible" : true};
      rowData.imgOk = {"isVisible" : false};
      rowData.imgCancel = {"isVisible" : false};
      this.view.segmentDevices.setDataAt(rowData, context.row, context.section); 
      this.view.nonFinancialComponent.updateActionInRMS();
      this.commonEventHandler(this.dismissLoading, "");
    },

    changeDeviceStatusOnClick : function(context){
      this.commonEventHandler(this.showLoading, "");
      var rowData = this.view.segmentDevices.data[context.row];
      let newStatus = rowData.changeStatus.text;
      if (newStatus === "SUSPEND"){
        const deviceList = this.view.segmentDevices.data;
        let l = 0;
        for(let a=0;a < deviceList.length;a++){
          if (deviceList[a].changeStatus.text !== "SUSPEND"){
            l++;
          }
        }
        if (l === deviceList.length-1){
          this.commonEventHandler(this.dismissLoading, "");
          EventEmitter.mandatoryEvent.emit(this.suspendFailure, "suspendFailure", []);
          return;
        }
      }
      this.actionType = "device_active";
      if (newStatus === "SUSPEND"){
        newStatus = "SUSPENDED";
        this.actionType = "device_suspend";
      }
      this.view.nonFinancialComponent.stepUpRequired = status => { this.view.flxNonFinancialComponent.setVisibility(true);
                                                                  this.commonEventHandler(this.dismissLoading, "");};
      this.view.nonFinancialComponent.analyzeActionSuccess = status => {this.view.flxNonFinancialComponent.setVisibility(false);
                                                                        UserManagementPresentationController.updateDeviceStatus(rowData.deviceId, newStatus, success => this.onUpdateDeviceStatusSuccess(context, success),
                                                                                                                                this.onUpdateDeviceStatusFailure);};
      this.view.nonFinancialComponent.analyzeActionFailure = status =>{ this.view.flxNonFinancialComponent.setVisibility(false);
                                                                       this.commonEventHandler(this.dismissLoading, "");alert(status);};
      this.view.nonFinancialComponent.analyzeAction(this._username,this.actionType,this.sessionId);
    },

    onUpdateDeviceStatusSuccess : function(context, response){
      var rowData = this.view.segmentDevices.data[context.row];
      var deviceStatusResponse = response.UpdateDeviceStatus[0];
      rowData.status1 = {"isVisible" : deviceStatusResponse.active };
      rowData.status2 = {"isVisible" : !deviceStatusResponse.active };
      rowData.changeStatus = {
        "text" : deviceStatusResponse.active  ? "SUSPEND" : "ACTIVE",
        "skin" : deviceStatusResponse.active  ? "sknSuspend" : "sknActive"};      
      this.view.segmentDevices.setDataAt(rowData, context.row, context.section);
      this.view.nonFinancialComponent.updateActionInRMS();
       this.commonEventHandler(this.dismissLoading, "");
    },

    onUpdateDeviceStatusFailure : function (error) {   
      alert("Failed to update device status");
       this.commonEventHandler(this.dismissLoading, "");
    },

    changePasswordOnClick : function(){
      if (this.view.tabSelfService.txtOldPassword.text === "") {
        this.view.tabSelfService.lblChangePwdNotification.text = "Please enter the Current Password";        
        return;
      }
      if (this.view.tabSelfService.txtNewPassword.text === "") {
        this.view.tabSelfService.lblChangePwdNotification.text = "Please enter the New Password";        
        return;
      }
      if (this.view.tabSelfService.txtConfirmPassword.text === "") {
        this.view.tabSelfService.lblChangePwdNotification.text = "Please confirm the Password";       
        return;
      }
      if (this.view.tabSelfService.txtNewPassword.text !== this.view.tabSelfService.txtConfirmPassword.text) {
        this.view.tabSelfService.lblChangePwdNotification.text = "Passwords do not match";       
        return;
      }
      var newPassword = this.view.tabSelfService.txtNewPassword.text;
      if (newPassword.length < this.policy.minLength || newPassword.length > this.policy.maxLength) {
        this.view.tabSelfService.lblChangePwdNotification.text = `Password should be minimum ${this.policy.minLength} and maximum ${this.policy.maxLength} characters`;
        return;
      }
      if (this.policy.notSequence && !this.seqCheck(newPassword)) {
        this.view.tabSelfService.lblChangePwdNotification.text = "Password should not contain a number or letter sequence";        
        return;
      }
      if (!this.UniqueCount(newPassword)) {
        this.view.tabSelfService.lblChangePwdNotification.text = `Password should contain minimum ${this.policy.minDiffChars} different characters`;        
        return;
      }
      if(this.policy.notUserAttribute && newPassword.toLowerCase().includes(this._username.toLowerCase())){
        this.view.tabSelfService.lblChangePwdNotification.text = "Password should not contain username";
        return;
      }
      this.commonEventHandler(this.showLoading, "");
      UserManagementPresentationController.changeUserPassword(this._username, this.view.tabSelfService.txtOldPassword.text, newPassword,
                                                              this.onPasswordChangeSuccess, this.onPasswordChangeFailure);
    },

    cancelChangePasswordOnClick : function(){
      this.resetChangePasswordUI();      
    },

    onPasswordChangeSuccess : function(response){
      if(response.ChangePassword[0].status){
        this.resetChangePasswordUI();
        this.view.tabSelfService.lblChangePwdNotification.text = "Password Changed Successfully";
        this.view.tabSelfService.lblChangePwdNotification.skin = "sknHIDNotification";
      } else {this.onPasswordChangeFailure("error");}
       this.commonEventHandler(this.dismissLoading, "");
       
    },

    onPasswordChangeFailure : function(error){
      var strError = JSON.stringify(error);
      var changePwdError = "";
      if(strError.includes("Password does not match")){
        changePwdError = "Invalid Old Password";
      } else {changePwdError = "Password is not Valid";}
      this.view.tabSelfService.lblChangePwdNotification.text = changePwdError;
      this.view.tabSelfService.lblChangePwdNotification.skin = "sknHIDError";
       this.commonEventHandler(this.dismissLoading, "");
    },

    registerApproveOnClick : function(){
       this.commonEventHandler(this.showLoading, "");
      UserManagementPresentationController.registerApproveDevice(this._username, this.onDeviceRegSuccess,
                                                                 this.onDeviceRegFailure);
    },

    onDeviceRegSuccess : function(response) {
      this.view.tabSelfService.flxRegisterDevice0.setVisibility(false);
      this.view.tabSelfService.flxRegisterDevice1.setVisibility(true);
      this.view.tabSelfService.qrcodegeneratorNew.dataToEncode = response.provisioningMsg;
      this.view.tabSelfService.qrcodegeneratorNew.generate();
      this.view.tabSelfService.txtUserIdValue.text = response.username;
      this.view.tabSelfService.txtInviteCodeValue.text = response.inviteCode;
      this.view.tabSelfService.txtServiceUrlValue.text = response.url;
      this.view.forceLayout();
       this.commonEventHandler(this.dismissLoading, "");
      UserManagementPresentationController.initiateDeviceRegistrationPolling(response.deviceId, this.onPollingSuccess,
                                                                             this.onPollingFailure);     
    },

    onDeviceRegFailure : function(error) {
      alert("Failed to register new Approve device : " + JSON.stringify(error));
       this.commonEventHandler(this.dismissLoading, "");
    },

    onPollingSuccess : function(response){
      this.view.tabSelfService.flxRegisterDevice0.setVisibility(true);
      this.view.tabSelfService.flxRegisterDevice1.setVisibility(false);
      this.getUserDevices();
    },

    onPollingFailure : function(error){
      //alert("Failed to get Device Registration Status, if registered successfully, click on Done Button");
    },

    getPasswordPolicy : function(callback){      
      UserManagementPresentationController.getPasswordPolicy(response => this.onPasswordPolicySuccess(response, callback), 
                                                             error => this.onPasswordPolicyFailure(callback));
    },

    onPasswordPolicySuccess : function(response, callback){      
      this.policy = response.PasswordPolicy[0];
      let i = 1;
      this.view.tabSelfService[`lblPolicy${i}`].text = `Password should be minimum ${this.policy.minLength} and maximum ${this.policy.maxLength} characters`;
      i++;
      if(this.policy.notOldPassword){
        this.view.tabSelfService[`lblPolicy${i}`].text =  "Password should not be same as your old password";
        i++;
      }
      this.view.tabSelfService[`lblPolicy${i}`].text =  `Password should have minimum ${this.policy.minDiffChars} different characters`;
      i++;
      if(this.policy.notSequence){
        this.view.tabSelfService[`lblPolicy${i}`].text = "Password must not be a letters or numbers sequence";
        i++;
      }
      if(this.policy.notUserAttribute){
        this.view.tabSelfService[`lblPolicy${i}`].text = "Password should not contain username and is not a user attribute";
      }
      this.view.forceLayout();
      callback();
    },

    onPasswordPolicyFailure : function(callback){
      this.policy = {"minLength" : 5, "maxLength" : 100, "notSequence" : true, "minDiffChars" : 5, "notUserAttribute" : false};
      this.view.tabSelfService.lblPolicy1.text = "Password should be minimum 5 and maximum 100 characters";
      this.view.tabSelfService.lblPolicy2.text = "Password should have minimum 5 different characters";
      this.view.tabSelfService.lblPolicy3.text = "Password must not be a letters or numbers sequence";
      this.view.forceLayout();
      callback();
    },

    resetChangePasswordUI : function(){
      this.view.tabSelfService.txtOldPassword.text = "";
      this.view.tabSelfService.txtNewPassword.text = "";
      this.view.tabSelfService.txtConfirmPassword.text = "";
      this.view.tabSelfService.lblChangePwdNotification.text = "";
    },

    seqCheck: function(s) {
      // Check for sequential numerical characters
      for (let i in s)
        if (+s[+i + 1] == +s[i] + 1 && +s[+i + 2] == +s[i] + 2) return false;
      // Check for sequential alphabetical characters
      for (let i in s)
        if (String.fromCharCode(s.charCodeAt(i) + 1) == s[+i + 1] && String.fromCharCode(s.charCodeAt(i) + 2) == s[+i + 2]) return false;
      return true;
    },
    UniqueCount: function(nonUnique) {
      var unique = nonUnique.split('').filter(function(item, i, ar) {
        return ar.indexOf(item) === i;
      }).join('');
      return unique.length > this.policy.minDiffChars;
    },
    commonEventHandler(event,intent){
      if(event){
        event(intent);
      }
    }
  };
});