var gblRegId = null;
var gblIsUpdateRequired = false;
const constKeyChainIdentifier = "HID_SDK_PushID";
const onlineMode = "Online";
const offlineMode = "Offline";
const offlineForm = "frmNotification";
var offlineTds = '';
gblNotificationFlow = false;
gblAppBackground = false;
function registerPushAndroid(){ 
   var config = {
      senderid : "355440045191"
   };
   let pushIDInKeyStore = kony.keychain.retrieve({"identifier" : constKeyChainIdentifier});
   if(typeof(pushIDInKeyStore) == "object" &&  pushIDInKeyStore.hasOwnProperty("securedata")){
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

function regSuccessAndroidCallback(regId) {
    kony.print("ApproveSDK ---> JavaScript regSuccessCallback() called **");
    kony.print(regId);
    var data = {};
    if (kony.os.deviceInfo().name.toLowerCase() === 'android'){
      data.identifier = constKeyChainIdentifier;
      data.securedata = regId
    }
    kony.keychain.save(data);
    gblRegId = regId;
}

function regFailureAndroidCallback(errormsg) {
    kony.print("ApproveSDK ---> JavaScript regFailureCallback() called *");
    kony.print(errormsg.failurereason);
    kony.print(errormsg.description);
}

function onlinePushNotificationAndroidCallback(msg) {
    if(gblNotificationFlow){
      //Already there is a pending Notification So ignoring
      return;
    }
    gblNotificationFlow =true;
    kony.print("ApproveSDK ---> onlinePushNotificationCallback() called * " + JSON.stringify(msg));
    kony.print(msg);
    if(kony.application.getCurrentForm().id !== "FrmSplash"){
      showNotificationComponent(msg.tds,onlineMode);
    }else{
      offlinePushNotificationAndroidCallback(msg);
    }
}

function offlinePushNotificationAndroidCallback(msg) {
    kony.print("ApproveSDK ---> CurrForm is " + kony.application.getCurrentForm().id)
    if(gblNotificationFlow &&  kony.application.getCurrentForm().id !== "FrmSplash"){
      return;
    }
    gblNotificationFlow =true;
    kony.print("ApproveSDK ---> offlinePushNotificationCallback() called *** " + JSON.stringify(msg));
    kony.print(msg);
    //showNotificationComponent(msg.tds,offlineMode);
   offlineTds = msg.tds;
}

function unregSuccessAndroidCallback() {
    kony.print("ApproveSDK ---> unregSuccessCallback() called *");
}

function unregFailureAndroidCallback(errormsg) {
    kony.print("ApproveSDK ---> unregFailureCallback() called *");
    kony.print(errormsg.errorcode);
    kony.print(errormsg.errormessage);
}

function isAndroid(){
    var deviceInfo = kony.os.deviceInfo();
    return deviceInfo.name.toLowerCase() === 'android';
}
function callbackAndroidSetCallbacks() {
    kony.push.setCallbacks({
        onsuccessfulregistration: regSuccessAndroidCallback,
        onfailureregistration: regFailureAndroidCallback,
        onlinenotification: onlinePushNotificationAndroidCallback,
        offlinenotification: offlinePushNotificationAndroidCallback,
        onsuccessfulderegistration: unregSuccessAndroidCallback,
        onfailurederegistration: unregFailureAndroidCallback
    });
}

function registerNotifications(){
    gblSDKNotificationManager = sdkNotificationManager;
    kony.print("ApproveSDK ---> PostAppInit called");
    if(isAndroid()){
       callbackAndroidSetCallbacks();
       registerPushAndroid();
    }
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
            }
            else{
              currForm.remove(notificationComponent);
            }
           currForm.onDeviceBack = originalDeviceBack;
           currForm.onHide = originalOnHide;
           gblAppBackground = false;
           gblNotificationFlow =false;
       }
    }
    if(mode === offlineMode){
       currForm.ApproveNotificationMobileSDK.onCompletion = (status) =>{
          kony.print("ApproveSDK ---> Notification set stauts " + status);
          gblNotificationFlow =false;
          gblAppBackground = false;
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

