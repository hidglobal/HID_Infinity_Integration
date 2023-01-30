/***************************************************************************************************************************
FileName : sdkNotificationManager.js                                       
Purpose  : Handles HID-Approve push notifications and dynmically Injects Notification UI in form
Author   : Andey Savanth
Org      : HID Global
How to   :  step1 : Update senderID for GCM Android in gblAndroidSenderID variable.(Mandatory)
            step2 : call registerNotifications function from preAppInit.(Mandatory)
            step3 : check registerNotificationCallbacks for custom callbacK invocation.
                    If no customizations is required no need to change any callbacks.
            step4 : Handle onlinePushNotificationCallback and offlinePushNotificationCallback
                    callbacks as per your requirment.(Mandatory)
            step5 : call showNotificationComponent(txID , mode) to show Notifications and make any customizations
                    like deviceBack if Required.(Mandatory)
Note     :  This is an implementation sample only and used for reference. It may not work out of the box.
            This file is mandatory for HID-Approve PushNotifications.
****************************************************************************************************************************/
var gblAndroidSenderID = "355440045191";
var gblRegId = null;
var gblIsUpdateRequired = false;
const constKeyChainIdentifier = "HID_SDK_PushID";
const onlineMode = "Online";
const offlineMode = "Offline";
const offlineForm = "frmNotification";
var offlineTds = '';
gblNotificationFlow = false;
gblAppBackground = false;
function registerPushHIDApprove(){
   var config =  isAndroid() ?{senderid : gblAndroidSenderID} : [1,2];
   let pushIDInKeyStore = kony.keychain.retrieve({"identifier" : constKeyChainIdentifier});
   kony.print("ApproveSDK ---> pushIDInKeyStore is" + JSON.stringify(pushIDInKeyStore));
   if(typeof(pushIDInKeyStore) == "object" &&  pushIDInKeyStore.hasOwnProperty("securedata") && pushIDInKeyStore.securedata){
     kony.print("ApproveSDK ---> PushId Found in Keystore is " + pushIDInKeyStore.securedata);
     gblRegId = pushIDInKeyStore.securedata;
     gblIsUpdateRequired = false;
   }else{
     kony.print("ApproveSDK ---> PushId Not Found in Keystore ");
     kony.push.register(config);
     gblIsUpdateRequired = true;
   } 
  kony.print("ApproveSDK ---> Push called");
}

function pushRegSuccessCallback(regId) {
    kony.print("ApproveSDK ---> JavaScript regSuccessCallback() called **");
    kony.print(regId);
    var data = {};
    if(isAndroid()){
      data.identifier = constKeyChainIdentifier;
      data.securedata = regId
    }else{
      data.identifier = constKeyChainIdentifier;
      data.securedata = regId
      data.secureaccount = "HID";
    }
    let status = kony.keychain.save(data);
    kony.print("ApproveSDK ---> Kony Keychain Status " + JSON.stringify(status));
    gblRegId = regId;
}

function pushRegFailureCallback(errormsg) {
    kony.print("ApproveSDK ---> JavaScript regFailureCallback() called *");
    kony.print(errormsg.failurereason);
    kony.print(errormsg.description);
}

function onlinePushNotificationCallback(msg) {
    kony.print("ApproveSDK ---> onlinePushNotificationCallback() called * " + JSON.stringify(msg));
    if(gblNotificationFlow){
      //Already there is a pending Notification So ignoring
      return;
    }
    gblNotificationFlow =true;
    kony.print("ApproveSDK ---> onlinePushNotificationCallback() called * " + JSON.stringify(msg));
    kony.print(msg);
    if(kony.application.getCurrentForm() && kony.application.getCurrentForm().id !== "FrmSplash"){
      showNotificationComponent(msg.tds,onlineMode);
    }else{
      offlinePushNotificationCallback(msg);
    }
}

function offlinePushNotificationCallback(msg){
  kony.print("ApproveSDK ---> msg.tds" + msg.tds);
  // kony.print("ApproveSDK ---> CurrForm is " + kony.application.getCurrentForm().id)
  if(gblNotificationFlow && kony.application.getCurrentForm() && kony.application.getCurrentForm().id !== "FrmSplash"){
    return;
  }
  gblNotificationFlow =true;
  kony.print("ApproveSDK ---> offlinePushNotificationCallback() called *** " + JSON.stringify(msg));
  kony.print(msg);
  if(gblAppBackground){
    showNotificationComponent(msg.tds,onlineMode);
  }
  offlineTds = msg.tds;
}

function deRegisterPushSuccessCallback() {
    kony.print("ApproveSDK ---> unregSuccessCallback() called *");
}

function deRegPushFailureCallback(errormsg) {
    kony.print("ApproveSDK ---> unregFailureCallback() called *");
    kony.print(errormsg.errorcode);
    kony.print(errormsg.errormessage);
}

function isAndroid(){
    var deviceInfo = kony.os.deviceInfo();
    return deviceInfo.name.toLowerCase() === 'android';
}
function registerNotificationCallbacks() {
    kony.push.setCallbacks({
        onsuccessfulregistration: pushRegSuccessCallback,
        onfailureregistration: pushRegFailureCallback,
        onlinenotification: onlinePushNotificationCallback,
        offlinenotification: offlinePushNotificationCallback,
        onsuccessfulderegistration: deRegisterPushSuccessCallback,
        onfailurederegistration: deRegPushFailureCallback
    });
}

function registerNotifications(){
    gblSDKNotificationManager = sdkNotificationManager;
    kony.print("ApproveSDK ---> PostAppInit called");
    registerNotificationCallbacks();
    registerPushHIDApprove();
}

function showNotificationComponent(msg,mode){
  kony.print("ApproveSDK ---> Mode " + mode);
//   if(mode === offlineMode){
//     kony.print("NotificationManger ----> Offline Notification Called");
//     var ftn = new kony.mvc.Navigation(offlineForm);
//      ftn.navigate();
//   }
  var notificationComponent = new com.hid.ApproveNotificationMobileSDK(
    {
      "clipBounds": true,
      "id": "ApproveNotificationMobileSDK",
      "isVisible": true,
      "left": "0dp",
      "top": "0dp",
      "width": "100%",
      "height": "100%",
      "zIndex": 200
    }, {}, {});
    notificationComponent.transactionID = msg;
    var currForm = kony.application.getCurrentForm(); 
    var originalDeviceBack = currForm.onDeviceBack;
    var originalOnHide = currForm.onHide;
    notificationComponent.currentView = currForm;
    if(currForm.id == "frmBankDashboard"){
      currForm.ApproveNotificationMobileSDK.setVisibility(true);
      currForm.ApproveNotificationMobileSDK.transactionID = msg;
    }
    else{
      currForm.add(notificationComponent);
    }
    currForm.onDeviceBack = ()=>{
      if(mode === onlineMode){
         gblNotificationFlow = false;
        if(currForm.id == "frmBankDashboard"){
          currForm.ApproveNotificationMobileSDK.setVisibility(false);
          let count = currForm.lblNotificationCounter.text;
          count = (count == 0 || count == "" || count == null) ? 1 : +count+1;
          currForm.lblNotificationCounter.text = `${parseInt(count)}`;  
          currForm.lblNotificationCounter.setVisibility(true);
        }
        else{
          currForm.remove(notificationComponent);
        }
        currForm.onDeviceBack = originalDeviceBack;
      }else{
        kony.application.exit();
      }
    }
    currForm.onHide = ()=>{
      kony.print("device Foreground");
      appForeground = true;
    };
    if(mode === onlineMode){
          currForm.ApproveNotificationMobileSDK.onCompletion = (status)=> {
            kony.print("ApproveSDK ---> Notification set stauts " + status);
            if(currForm.id == "frmBankDashboard"){
              currForm.ApproveNotificationMobileSDK.setVisibility(false);
              if(!status){
                let count = currForm.lblNotificationCounter.text;
                count = (count == 0 || count == "" || count == null) ? 1 : +count+1;
                currForm.lblNotificationCounter.text = `${parseInt(count)}`;  
                currForm.lblNotificationCounter.setVisibility(true);
              }
            }
            else{
              currForm.remove(notificationComponent);
            }
           currForm.onDeviceBack = originalDeviceBack;
           currForm.onHide = originalOnHide;
           //gblAppBackground = false;
           gblNotificationFlow =false;
       }
    }
    if(mode === offlineMode){
       currForm.ApproveNotificationMobileSDK.onCompletion = (status) =>{
          kony.print("ApproveSDK ---> Notification set stauts " + status);
          gblNotificationFlow =false;
         // gblAppBackground = false;
          kony.application.exit();
       }
    }
    currForm.ApproveNotificationMobileSDK.showAuthentication();
}

var sdkNotificationManager  = {
    getPushId : function(){
      return gblRegId;
    },
    isUpdateRequired : function(){
      return gblIsUpdateRequired;
    },
    showOfflineNotification : function(){
     showNotificationComponent(offlineTds,offlineMode);
   },
  
};

