/***************************************************************************************************************************
FileName : HidRmsSdkManager.js                                       
Purpose  : Handles ThreatMark SDK calls
Author   : Andey Savanth
Org      : HID Global
How to   : Step 1 : Configure your RMSMobile ReverseProxy in HIDConstants.
           Step 2 : Assign startSdkAndAssignStopCallbacksAndroid function to postAppInit.

Note: This is common for both android and IOS

****************************************************************************************************************************/

let HidRMSConstants = {
      android : {
         "reverseProxyURL" : `https://hidglobal-qa.konycloud.com/services/HIDRMS/androidReverseProxy`,
         "isDebugEnabled" : true,
         "isSSLPinned" : true
      },
      ios : {
         "reverseProxyURL" : `https://activid.hidps.org:8558/application/mb_ios/ios`,
         "isDebugEnabled" : true,
         "isSSLPinned" : false
      }
    };
    HidRmsSDKManager = {
        app_session_id : "",
        rmsIOSWrapperObj : null,
        isThreatMarkSDKStarted : false,
        getRMSAppSessionId : function(){
          return this.app_session_id;
        },
        setRMSAppSessionId : function(val){
          this.app_session_id = val;
        },
        startSdkAndAssignStopCallbacks : function(){
          if(this.isAndroid()){
             this.startSdkAndAssignStopCallbacksAndroid();
          }else{
            this.startSdkAndAssignStopCallbacksIOS();
          }  
        },
        startSdkAndAssignStopCallbacksIOS : function(){
          var wrapperClass = objc.import("HIDRMSWrapper");
          this.rmsIOSWrapperObj = wrapperClass.alloc().jsinit(); 
          if(this.rmsIOSWrapperObj){
            kony.print("HIDRMSWrapper ---> framework Loaded successful");
            var status = this.rmsIOSWrapperObj.startRMSSDKIsSSLPinningEnabledIsLogsEnabled(HidRMSConstants.ios.reverseProxyURL, HidRMSConstants.ios.isSSLPinned, HidRMSConstants.ios.isDebugEnabled);
            kony.print("HIDRMSWrapper ---> Framework start status " + status);
            this.isThreatMarkSDKStarted = true;
          }else{
            kony.print("HIDRMSWrapper ---> Framework Not Loaded");
          }
        },
         startSdkAndAssignStopCallbacksAndroid : function(){
           kony.print("TMK_SDK =>Inside PostAppInit");
           kony.print("TMK_SDK => reverseProxyURL " + HidRMSConstants.android.reverseProxyURL);
           let rmsActivity = java.import("com.hidglobal.ia.RMSWrapper.HidRmsActivity");
           if(rmsActivity==null){
                kony.print("Object not loaded");
            }
           let rmsWrapperObj = rmsActivity.getActivityContext();
           if(rmsWrapperObj == null){
             // Todo need to handle it later
             kony.print("TMK_SDK => rmsWrapperObj is : Wrapper object not loaded");
             return;
           }
           kony.print("TMK_SDK => rmsWrapperObj is : Wrapper object loaded");
           var status = -1;
           status = rmsWrapperObj.startRMSSDK(HidRMSConstants.android.reverseProxyURL,HidRMSConstants.android.isSSLPinned,HidRMSConstants.android.isDebugEnabled);
           kony.print("TMK_SDK => status of rms SDK is : "+ status);
           
           if(status == 0){
             this.isThreatMarkSDKStarted = true;
           }
           var stopRMSSDK = () => {
             if(this.isThreatMarkSDKStarted){
               rmsWrapperObj.stopRMSSDK();
               this.isThreatMarkSDKStarted = false;
               kony.print("TMK_SDK => RMS SDK Stops");
             }
           };
           var  exitCallback = () => {
           stopRMSSDK();
         };
         var callbacksMapObject = {
            "onappterminate": {
              "functionID": exitCallback
             }
         };
         kony.application.addApplicationCallbacks(callbacksMapObject);
       },
       getCookieValues : function(deviceKey,sessionKey){
         if(this.isAndroid()){
           return this.getCookieValuesAndroid(deviceKey,sessionKey);
         }else{
           return this.getCookieValuesIOS(deviceKey,sessionKey);
         }
      },
      getCookieValuesIOS : function(deviceKey, sessionKey){
         if(this.rmsIOSWrapperObj){
           var cookieJSON = this.rmsIOSWrapperObj.getCookiesWithSessionKey(deviceKey, sessionKey);
           kony.print("RMSWrapper ---> cookieJSOn from SDK is " + cookieJSON);
           if(!cookieJSON.hasOwnProperty(deviceKey) || !cookieJSON.hasOwnProperty(sessionKey)){
              // do nothing;
           }
           return cookieJSON;
         }
      },
      getCookieValuesAndroid : function(deviceKey, sessionKey){

           let rmsActivity = java.import("com.hidglobal.ia.RMSWrapper.HidRmsActivity");
           if(rmsActivity==null){
                kony.print("Object not loaded");

            }
           let rmsWrapperObj = rmsActivity.getActivityContext();
           let cookieJSON =  rmsWrapperObj.getCookiesJSON(deviceKey,sessionKey);
           kony.print("RMS => cookieJSON : "+ JSON.stringify(cookieJSON));
           if(!cookieJSON.hasOwnProperty(deviceKey) || !cookieJSON.hasOwnProperty(sessionKey)){
              // do nothing else app will break
           }
         return cookieJSON;
       },     
      getClientIP : function(){
           let rmsActivity = java.import("com.hidglobal.ia.RMSWrapper.HidRmsActivity");
           if(rmsActivity==null){
                kony.print("Object not loaded");
            }
           let rmsWrapperObj = rmsActivity.getActivityContext();
           let clientIP =  rmsWrapperObj.getLocalIPAddress();
           if(!clientIP){
             throw {
              "type": "CUSTOM",
              "message": "IP Address is missing."
             };
           }
         return clientIP;
       },
      
       isAndroid : function(){
         var deviceInfo = kony.os.deviceInfo();
         return deviceInfo.name.toLowerCase() === 'android';
       }

      };