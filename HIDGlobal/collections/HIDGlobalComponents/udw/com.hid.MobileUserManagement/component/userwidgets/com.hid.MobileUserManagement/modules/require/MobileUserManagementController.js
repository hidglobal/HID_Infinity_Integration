define([`com/hid/MobileUserManagement/UserManagementPresentationController`], function(UserManagementPresentationController) {
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

var sdkConstants = {};
//var isRMSTrans = false;
sdkConstants.ERROR_LENGTH_MIN = `PIN length should be atleast #`;
sdkConstants.ERROR_LENGTH_MAX = `PIN length should be atmost #`;
sdkConstants.ERROR_PWD_MIN_NUM = `PIN should contain atleast # numbers`;
sdkConstants.ERROR_PWD_MAX_NUM = `PIN should contain atmost # numbers`;
sdkConstants.ERROR_PWD_NO_ALPHA = `Password should contain only numbers`;
sdkConstants.ERROR_PWD_MIN_ALPHA = `Password should contain atleast # letters`;
sdkConstants.ERROR_PWD_MAX_ALPHA = `Password should contain atmost # letters`;
sdkConstants.ERROR_PWD_MIN_UPPER = `Password should contain atleast # Uppercase letters`;
sdkConstants.ERROR_PWD_MAX_UPPER = `Password should contain atmost # Uppercase letters`;
sdkConstants.ERROR_PWD_MIN_LOWER = `Password should contain atleast # Lowercase letters`;
sdkConstants.ERROR_PWD_MAX_LOWER = `Password should contain atmost # Lowercase letters`;  
sdkConstants.ERROR_PWD_MIN_SPL = `Password should contain atleast # special Characters`;
sdkConstants.ERROR_PWD_MAX_SPL = `Password should contain atmost # special Characters`;
sdkConstants.ERROR_PIN = `PIN is incorrect`; 
sdkConstants.EXPIRED_PIN = `PIN is Expired`;
sdkConstants.ERROR_SAME_PIN = `New PIN cannot be same as old PIN`;
sdkConstants.ERROR_NEW_PWD_NOT_ENTERED = `Please enter the new PIN`;
sdkConstants.ERROR_CNF_PWD = "Please confirm the new PIN";
sdkConstants.ERROR_PWD_MATCH = `New PIN cannot be same as old PIN`
sdkConstants.ERROR_INVALID_PWD_UPD = `Invalid PIN`
sdkConstants.ERROR_INVALID_PIN = `PIN Cannot be Empty`;
sdkConstants.ERROR_PWD_NOT_ENTERED = `Please enter PIN`;
sdkConstants.ERROR_PWD_NOT_MATCH = `Entered PINs do not match`;

return {
correlationIdUserManagementPrefix : "MGMT-",
correlationId : "",
rmsActionSuccess : true,
rmsActionFailure : false, 
constructor: function(baseConfig, layoutConfig, pspConfig) {        
    this.view.segmentDevices.data = [];
    this.view.flxDeviceExtraOptions.onTouchStart = source => {}
    this.view.flxEditFriendlyName.onTouchStart = source => {}
    this.view.flxPasswordPrompt.onTouchStart = source => {}
    this.view.flxSuccess.onTouchStart = source => {}
    this.view.flxFailure.onTouchStart = source => {}
    this.view.flxLoading = source => {}
    this.view.txtEnterPin.onTouchStart = source =>{
                                 this.view.lblTransferError.setVisibility(false);};
    this.view.nonFinancialWithoutUI.actionSignSuccess = this.actionSignSuccess;
    this.view.nonFinancialWithoutUI.actionSignFailure = this.actionSignFailure;
    this.view.TransactionSigningMobileSDK.onPasswordPrompt = this.pwdPromtCallback;
    this.view.TransactionSigningMobileSDK.signTransactionSuccess = this.SCB_signTransaction;
    this.view.TransactionSigningMobileSDK.signTransactionFailure = this.FCB_signTransaction;
    this.view.btnpinback.onClick = this.btnPinBack_onClick;
    //this.view.TransactionSigningMobileSDK.passwordUpdateSuccess = this.SCB_passwordUpdate;
    //this.view.TransactionSigningMobileSDK.passwordUpdateError = this.FCB_passwordUpdate;
    this.view.TransactionSigningMobileSDK.onNotifyPassword = this.verifyPasswordCallback;
    this.view.btnSuccess.onClick = this.btnSuccess_onClick
    this.view.btnFailure.onClick = this.btnFailure_onClick
    this.view.segmentDevices.onRowClick = this.imgOptionsButtononClick
    //this.view.MobileUserManagement.top = "0%";
    //this.view.TransactionSigningMobileSDK.onUpdatePasswordCB = this.onUpdatePasswordCB;
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
    this.view.TransactionSigningMobileSDK.username = val;
    });
    //isRMSEnabled true or false
    defineGetter(this, "isRMSEnabled", function() {
    kony.print('isRMSEnabled:'+this._isRMSEnabled);
    return this._isRMSEnabled;
    });
    defineSetter(this, "isRMSEnabled", function(val){
    if(!(val) || val == undefined){
        this._isRMSEnabled = false;
    }else {
        this._isRMSEnabled = val;
    }
    });
},
policy : "",
sessionId : "",
actionType :"",
deviceId : "",
updatedFriendlyName : "",
selectedDeviceData : {},
loadUserManagement : function(sessionId,deviceId,userName){
    this.view.segmentDevices.data = [];
    this.sessionId = sessionId;
    this.deviceId = deviceId;
    this._username = userName;
    this.showLoading();
    this.getUserDevices();
},

getUserDevices : function(){
    UserManagementPresentationController.getDevicesForUser(this._username, this.getDevicesSuccess, this.getDevicesFailure);
},

imgOptionsButtononClick : function(){
    var rowData = this.view.segmentDevices.selectedRowItems;
    this.selectedDeviceData = rowData[0];

    //alert(JSON.stringify(this.selectedDeviceData))
    if (this.selectedDeviceData.status1.isVisible === true){
        this.view.lblDeviceStatusChange.text = "Suspend Device"
        }
        else{
            this.view.lblDeviceStatusChange.text = "Activate Device"
        }
    this.view.flxDeviceExtraOptions.setVisibility(true);
    this.view.forceLayout();
},

btnBackonClick : function(){
    this.view.flxDeviceExtraOptions.setVisibility(false);
    this.view.forceLayout();
},


registeredDeviceBackButtononClick : function(){   
    kony.print("back button called --> registeredDeviceBackButtononClick");    
    EventEmitter.mandatoryEvent.emit(this.registeredDeviceBackButtononClick, "registeredDeviceBackButtononClick", []);
},

lblDeviceStatusOnClick : function(){
    //this.view.segmentDevices.data = [];
    this.view.flxDeviceExtraOptions.setVisibility(false);
    this.changeDeviceStatusOnClick();
    this.view.forceLayout();
},

getDevicesSuccess : function(response){      
    if(response.SearchDevices.length>0){
    let dataSet = response.SearchDevices;
    let deviceData = [];       
    for(var i=0; i<dataSet.length; i++){
        if(dataSet[i].friendlyName && dataSet[i].friendlyName !== null) {
        let devices = {
            "friendlyName" : { "text" : dataSet[i].friendlyName, "enable" : false},
            deviceId : (dataSet[i].deviceId && dataSet[i].deviceId !== null && dataSet[i].deviceId !== "") ? dataSet[i].deviceId : "",
            "status1" :  {"isVisible" : dataSet[i].active,"fontColor":"2c8f1b"},
            "status2" : {"isVisible" : !dataSet[i].active,"fontColor":"8f1b1b"},
            validFrom : (dataSet[i].startDate && dataSet[i].startDate !== null && dataSet[i].startDate !== "") ? dataSet[i].startDate.slice(0,10): "",
            validTo : (dataSet[i].expiryDate && dataSet[i].expiryDate !== null && dataSet[i].expiryDate !== "") ? dataSet[i].expiryDate.slice(0,10) : "",
        }
        deviceData.push(devices);
    }
    this.view.forceLayout();
    }

    let widgetDataMap = {
        "lblDeviceName" : "friendlyName",
        "lblDeviceId" : "deviceId",
        // "imgDeviceActive" : "status1",
        // "imgDeviceSuspended" : "status2",
        "lblDeviceRegisteredDate" : "validFrom",
        "lblDeviceExpiryDate" : "validTo",
        "lblDeviceStatusActive" : "status1",
        "lblDeviceStatusSuspend": "status2"
    };
    this.view.segmentDevices.widgetDataMap = widgetDataMap;      
    this.view.segmentDevices.data = deviceData;
    this.view.forceLayout();
    }
    this.dismissLoading();
    this.view.forceLayout();
},

getDevicesFailure : function(error){
    alert("Failed to get the list of devices");
    this.dismissLoading();
},

deletedeviceButtonClick: function(){
    this.view.flxDeviceExtraOptions.setVisibility(false);
    const deviceList = this.view.segmentDevices.data;
    let l = 0;
    for(let a=0;a < deviceList.length;a++){
        if (deviceList[a].status1.isVisible !== true){
        l++;
        }
    }
    if (l === deviceList.length-1 && this.selectedDeviceData.status1.isVisible === true){
        this.setFailureStatus("Delete Device failed! Can not Delete only active device");
        this.dismissLoading();
    }
    else if (this.selectedDeviceData.deviceId == this.deviceId){
        this.setFailureStatus("Delete Device failed! Can not Delete current logged in Device");
        this.dismissLoading();
    }
    else if (this.view.segmentDevices.data.length === 1){
        //EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Delete Device Failed, Only One Device left!"]);
        this.setFailureStatus("Delete Device failed! Can not delete only active device");
        this.dismissLoading();
    }
    else{
        var rowData = this.selectedDeviceData;
        this.showLoading();
        this.actionType = "Delete_Device";
        if(this._isRMSEnabled){
                let params = { action_type : this.actionType,
                            app_user_id : this._username};

                this.view.nonFinancialWithoutUI.actionCreateSuccess = status => {   
                                                                                    this.dismissLoading();
                                                                                    this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
                                                                                    
                                                                                };
                this.view.nonFinancialWithoutUI.actionCreateFailure = status => {
                                                                                    this.setFailureStatus("Delete Device Failed");
                                                                                    this.dismissLoading();

                                                                                };                                                       

                this.view.nonFinancialWithoutUI.actionCreate(params,this.sessionId);

        } else{

            this.dismissLoading();
            this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
        }
    }
    this.view.forceLayout();
},

passwordSubmitOnClick: function(){
    //this.view.flxPasswordPrompt.setVisibility(false);
    this.showLoading();
    if (this.view.txtEnterPin.text === ""){
        this.dismissLoading();
        this.showPwdPromptError(true,"Pin can not be empty");
    }
    else{
        var password = this.view.txtEnterPin.text
        this.view.txtEnterPin.text = "";
        this.view.TransactionSigningMobileSDK.validatePassword(password);
    }
},


verifyPasswordCallback : function(){
    },

signAction : function(){
    this.view.nonFinancialWithoutUI.actionSign("password");
},


actionSignSuccess : function(status) {
    if (this.actionType === "Delete_Device"){
        var deleteDeviceId = this.selectedDeviceData.deviceId;
        this.unassignDevice(deleteDeviceId);
        }
    else if (this.actionType === "device_rename"){
        UserManagementPresentationController.updateFriendlyName(this.selectedDeviceData.deviceId, this.updatedFriendlyName, this.correlationId,
                                                            success =>this.editFriendlyNameSuccess(success), 
                                                            error => this.editFriendlyNameFailure(error)
                                                            );}
    else if (this.actionType === "device_active" || this.actionType === "device_suspend"){
        let newStatus = this.selectedDeviceData.status1.isVisible === true ? "SUSPENDED" : "ACTIVE";
        UserManagementPresentationController.updateDeviceStatus(this.selectedDeviceData.deviceId, newStatus, this.correlationId,success => this.onUpdateDeviceStatusSuccess(success),
                                                                                                                                this.onUpdateDeviceStatusFailure);
    }
    },

actionSignFailure : function(error) {
    this.dismissLoading();
    if (this.actionType === "Delete_Device"){
        this.setFailureStatus("Delete Device Failed")
    }
    else if (this.actionType === "device_rename"){
        this.setFailureStatus("Failed to Edit Friendly Name");
    }
    else if (this.actionType === "device_active" || this.actionType === "device_suspend"){
        this.setFailureStatus("Failed to change device Status");
    }
        },



//Public Method
    unassignDevice: function(deviceId){
    this.showLoading();
    UserManagementPresentationController.unassignDevice(deviceId,"SUSPENDED","",this.correlationId,
                                                        success => this.unassignDeviceSuccess(deviceId,success),
                                                        error => this.unassignDeviceError(error)
                                                        );
},

unassignDeviceSuccess: function(deviceId,response){
    this.deleteDevice(deviceId);
},

unassignDeviceError: function(error){
    this.dismissLoading();
    this.setFailureStatus("Delete Device Failed, Something Went Wrong!!");
    //EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Delete Device Failed, Something Went Wrong!!"]);

},

editFriendlyNameButtonOnClick : function(){
    this.view.flxDeviceExtraOptions.setVisibility(false);
    this.view.lblError.setVisibility(false);
    this.view.txtEditFriendlyName.text = this.selectedDeviceData.friendlyName.text;
    this.view.flxEditFriendlyName.setVisibility(true);
    this.view.forceLayout();
},


editFriendlyNameCancelOnClick : function(){
    this.view.flxEditFriendlyName.setVisibility(false);
},

editFriendlyNameDoneOnClick : function(){
    if(this.view.txtEditFriendlyName.text === ""){
        this.view.lblError.text = "Friendly Name can not be empty";
        this.view.lblError.setVisibility(true);
    }
    else if (this.view.txtEditFriendlyName.text === this.selectedDeviceData.friendlyName.text){
        this.view.lblError.text = "Updated Friendly Name should not be same as current friendly name";
        this.view.lblError.setVisibility(true);
    }
    else{
        this.view.flxEditFriendlyName.setVisibility(false);
        this.updatedFriendlyName = this.view.txtEditFriendlyName.text;
        this.editFriendlyName(this.updatedFriendlyName);
    }
},




assignDevice: function(deviceId){
    UserManagementPresentationController.assignDevice(deviceId,"ACTIVE",this._username,this.correlationId,
                                                    success => {this.dismissLoading();
                                                                this.setFailureStatus("Delete Device Failed, Something Went Wrong!!")
                                                                //this.loadUserManagement(this.sessionId,this.deviceId);
                                                                },
                                                    error => {  this.dismissLoading();
                                                                this.loadUserManagement(this.sessionId,this.deviceId,this._username);
                                                                alert(JSON.stringify(error));
                                                                }
                                                        );
    
},


deleteDevice : function(deviceId){
    UserManagementPresentationController.deleteDevice(deviceId,this.correlationId,
                                                    success => this.deleteDeviceSuccess(success), 
                                                    error =>  this.deleteDeviceError(deviceId,error)
                                                    );
    
},

deleteDeviceSuccess : function(response){
    if(this._isRMSEnabled){
        this.updateRMS(this.rmsActionSuccess);
    }
    this.setSuccessStatus("Device Deleted Successfully!!")
    this.dismissLoading();
    
},

deleteDeviceError : function(deviceId,response){
    this.assignDevice(deviceId);
    //EventEmitter.mandatoryEvent.emit(this.deleteFailure, "deleteFailure", ["Can not Delete Device, Something went wrong!"]);
},

updateRMS : function(status){
    this.view.nonFinancialWithoutUI.actionUpdate(status);
    },

editFriendlyName : function(newfriendlyName){
    this.showLoading();
    let rowData = this.selectedDeviceData;
    this.actionType = "device_rename";
    if(this._isRMSEnabled){
                let params = { action_type : this.actionType,
                        app_user_id : this._username};

                this.view.nonFinancialWithoutUI.actionCreateSuccess = status => {   this.dismissLoading();
                                                                                    this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
                                                                                };
                this.view.nonFinancialWithoutUI.actionCreateFailure = status => {
                                                                                    this.dismissLoading();
                                                                                    this.setFailureStatus("Failed to edit friendly Name");

                                                                                };

                //this.dismissLoading();
                this.view.nonFinancialWithoutUI.actionCreate(params,this.sessionId);
    } else{

        this.showLoading();
        this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
    }
},

editFriendlyNameSuccess : function(response){
    if(this._isRMSEnabled){
    this.updateRMS(this.rmsActionSuccess);
    }
    this.setSuccessStatus("Device Friendly Name Updated Successfully");
    this.dismissLoading();
    //this.loadUserManagement(this.sessionId,this.deviceId);
},

editFriendlyNameFailure : function(error){
    this.setFailureStatus("Failed to update device friendly name");
    this.dismissLoading();
},



changeDeviceStatusOnClick : function(){
    this.showLoading();
    var rowData = this.selectedDeviceData;
    let newStatus = rowData.status1.isVisible === true ? "SUSPEND" : "ACTIVE";
    if (newStatus === "SUSPEND"){
        const deviceList = this.view.segmentDevices.data;
        let l = 0;
        for(let a=0;a < deviceList.length;a++){
            if (rowData.status1.isVisible !== true){
            l++;
            }
    }
    if (l === deviceList.length-1){
        this.setFailureStatus("Device Status Update Failed! Can not Suspend only Active Device")
        this.dismissLoading();
        return;
    }
    else if (this.selectedDeviceData.deviceId == this.deviceId){
        this.setFailureStatus("Device Status Update Failed! Can not Suspend Current logged in device");
        this.dismissLoading();
        return;
    }
    }
    this.actionType = "device_active";
    if (newStatus === "SUSPEND"){
        newStatus = "SUSPENDED";
        this.actionType = "device_suspend";
    }
    if(this._isRMSEnabled){
    let params = { action_type : this.actionType,
                            app_user_id : this._username};

                this.view.nonFinancialWithoutUI.actionCreateSuccess = status => {   
                                                                                    this.dismissLoading();
                                                                                    this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
                                                                                };
                this.view.nonFinancialWithoutUI.actionCreateFailure = status => {
                                                                                    this.setFailureStatus("Device Status Change Failed!");
                                                                                    this.dismissLoading();

                                                                                };                                                         

                this.view.nonFinancialWithoutUI.actionCreate(params,this.sessionId);
    } else{       
        this.dismissLoading();
        this.view.TransactionSigningMobileSDK.signTransaction([this.actionType]);
    }
},

pwdPromtCallback : function(eventType, eventCode){
    kony.print(`ApproveSDK --> Inside pwdPromtCallback with eventType: ${eventType} and eventCode: ${eventCode}`);
    this.view.txtEnterPin.text = "";
    this.dismissLoading();
    if(eventCode == "5000"){
    this.setPasswordScreen(true);
    } if (eventCode == "5001"){
    this.setPasswordScreen(true);
    this.showPwdPromptError(true, sdkConstants.ERROR_PIN);
    }
    if(eventCode == "5002"){
    //this.contextSwitch("UpdatePassword");    
    this.setPasswordScreen(true);
    this.showPwdPromptError(true, sdkConstants.EXPIRED_PIN);    
    }
    this.view.forceLayout();
},

setPasswordScreen : function(visible){
    //this.commonEventEmitter(this.onPasswordPrompt, [visible]);
    this.view.flxPasswordPrompt.setVisibility(visible);
},
showPwdPromptError : function(visible, message){
    //this.setLoadingScreen(false);
    if(visible){
        this.view.lblTransferError.text = message;   
    }
    this.view.lblTransferError.setVisibility(visible);
},

btnPinBack_onClick : function(){
    if(this._isRMSEnabled){
        this.updateRMS(this.rmsActionFailure);
    }

    this.view.lblTransferError.setVisibility(false);
    this.view.txtEnterPin.text = "";
    this.view.flxPasswordPrompt.setVisibility(false);
    
},

SCB_signTransaction : function(otp){

this.correlationId = this.correlationIdUserManagementPrefix + this.generatUUID();
//this.setLoadingScreen(false);
this.setPasswordScreen(false);
this.view.flxPasswordPrompt.setVisibility(false);
this.resetPinUi();
this.showLoading();
if (this._isRMSEnabled){
    this.signAction();
}
else{
    //this.dismissLoading();
    if (this.actionType === "Delete_Device"){
            var deleteDeviceId = this.selectedDeviceData.deviceId;
            this.unassignDevice(deleteDeviceId);
        }
    else if (this.actionType === "device_rename"){
            UserManagementPresentationController.updateFriendlyName(this.selectedDeviceData.deviceId, this.updatedFriendlyName, this.correlationId,
                                                        success =>this.editFriendlyNameSuccess(success), 
                                                            error => this.editFriendlyNameFailure(error)
                                                        );}
    else if (this.actionType === "device_active" || this.actionType === "device_suspend"){
            let newStatus = this.selectedDeviceData.status1.isVisible === true ? "SUSPENDED" : "ACTIVE";
            UserManagementPresentationController.updateDeviceStatus(this.selectedDeviceData.deviceId, newStatus, this.correlationId,success => this.onUpdateDeviceStatusSuccess(success),
                                                                                                                                this.onUpdateDeviceStatusFailure);
        } 
    }
},
FCB_signTransaction : function(eventType,message){
    this.resetPinUi();
    kony.print("ApproveSDK ---> FCB_signTransaction with eventType: "+eventType);
    //this.setLoadingScreen(false);
    this.setPasswordScreen(false);
    if (this.actionType === "Delete_Device"){
            this.setFailureStatus("Delete Device Failed")
        }
    else if (this.actionType === "device_rename"){
            this.setFailureStatus("Failed to Edit Friendly Name");
            }
    else if (this.actionType === "device_active" || this.actionType === "device_suspend"){
            this.setFailureStatus("Failed to change device Status");
        }

    this.dismissLoading();
},

onUpdateDeviceStatusSuccess : function(response){
    if (this._isRMSEnabled){
        this.updateRMS(this.rmsActionSuccess);
    }
    this.dismissLoading();
    this.setSuccessStatus("Device Status Updated Successfully");
},

onUpdateDeviceStatusFailure : function (error) { 
    this.dismissLoading();
    this.setFailureStatus("Failed to update device status");
},

setSuccessStatus: function(status) {
    this.view.lblSuccessBody.text = status;
    this.view.flxSuccess.setVisibility(true);
},

setFailureStatus: function(status) {
    this.view.lblFailureBody.text = status;
    this.view.flxFailure.setVisibility(true);
},

btnSuccess_onClick : function(){
    this.loadUserManagement(this.sessionId,this.deviceId,this._username);
    this.view.flxSuccess.setVisibility(false);
},

btnFailure_onClick : function(){
    //this.loadUserManagement(this.sessionId,this.deviceId);
    this.view.flxFailure.setVisibility(false);
},

commonEventHandler(event,intent){
    if(event){
    event(intent);
    }
},


generatUUID: function() {
    var uuid = kony.os.createUUID();
    //kony.print("The created UUID is : " + uuid);
    return uuid;
    },

showLoading : function() {
    this.view.flxLoading.setVisibility(true);
},

dismissLoading : function(){
    this.view.flxLoading.setVisibility(false);
},

resetPinUi : function(){
    this.view.lblTransferError.setVisibility(false);
}

};


});
