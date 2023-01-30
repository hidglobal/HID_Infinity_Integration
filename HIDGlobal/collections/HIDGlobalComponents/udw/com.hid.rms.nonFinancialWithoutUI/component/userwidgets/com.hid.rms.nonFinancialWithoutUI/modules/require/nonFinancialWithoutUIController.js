define(['com/hid/rms/nonFinancialWithoutUI/nonFinancialBusinessController'],function(NonFinancialBusinessController) {
  var nonFinancialConstants = {};
  nonFinancialConstants.PLATFORM_MISMATCH = "Invalid Configuration, platform mismatch";
  nonFinancialConstants.INVALID_PLATFORM = "Invalid Configuration, platform should be one of web or mobile";
  nonFinancialConstants.INVALID_REQ_OBJECT = `Request is not type of Object `;
  nonFinancialConstants.INVALID_REQ_MISSING = `Invalid request, missing `;
  nonFinancialConstants.INVALID_SECURITY_ITEM_TYPE = `Invalid request, security_item_type should be one of [ password, sms, mtoken, grid, pki, otp, access_token, hw_token, operator, other, none ]`;
  nonFinancialConstants.HID_RMS_SDK_MANAGER_MISSING = `HidRmsSdkManager.js is missing from modules`;
  let validateReq = function(req, temp){
    if(typeof req !== "object")  return [false, nonFinancialConstants.INVALID_REQ_OBJECT];
    const keys = Object.keys(temp);
    for(const key of keys){
      if(!(key in req)) return  [false, `${nonFinancialConstants.INVALID_REQ_MISSING} ${key} parameter`];
      let value = temp[key];
      if(value){
        const output = value.call(this, req[key]);
        if(output[0] === false) return output;
      }
    }
    return [true];
  }
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {

    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, 'tmCookieTag', () => {
        return this._tmCookieTag;
      });
      defineSetter(this, 'tmCookieTag', value => {
        this._tmCookieTag = value;
      });
      defineGetter(this, 'tmCookieSid', () => {
        return this._tmCookieSid;
      });
      defineSetter(this, 'tmCookieSid', value => {
        this._tmCookieSid = value;
      });
      /*defineGetter(this, 'platform', () => {
        return this._platform;
      });*/
      /*defineSetter(this, 'platform', value => {
        this._platform = value;
      });*/
    },

    rmsBaseTemplate : {
      action_type : "",
      app_user_id : ""
    },
    app_action_id : "",
    actionCreate : function(request,app_session_id = null){ 
       let isValidArr = validateReq(request,this.rmsBaseTemplate);
       if(isValidArr[0] == false) this.throwCustomError(isValidArr[1]);
       this.username = request.app_user_id;
       this.app_session_id =  app_session_id == null ? Math.floor(Math.random()*100000) : app_session_id
       let finalParams = Object.assign({}, request);
       let platform = this.getPlatform();
       finalParams.platform = platform;
       finalParams.app_session_id =  this.app_session_id;
       this.populateCookies(finalParams);
       NonFinancialBusinessController.rmsActionCreate(finalParams,this.SCB_ActionCreate,this.FCB_ActionCreate);
    },
    SCB_ActionCreate : function(success){
       this.app_action_id = success.app_action_id;
       this.mandatoryEventEmitter(this.actionCreateSuccess, success, "actionCreateSuccess");
    },
    FCB_ActionCreate : function(error){
      this.mandatoryEventEmitter(this.actionCreateFailure, error, "actionCreateFailure");
    },
    actionSign : function(security_item_type){
      let app_user_id = this.username;
      let tm_action_id =  this.app_action_id;
      let platform = this.getPlatform();
      let req = {
                 app_user_id,
                 tm_action_id,
                 security_item_type,
                 platform
                };
      this.populateCookies(req);
      NonFinancialBusinessController.rmsActionSign(req,this.SCB_ActionSign, this.FCB_ActionSign)
    },
    SCB_ActionSign : function(success){
      this.optionalEventEmitter(this.actionSignSuccess, success);
    },
    FCB_ActionSign : function(error){
      this.optionalEventEmitter(this.actionSignFailure, error);
    },
    actionUpdate : function(status){
      let action_Status = status ? "rmsActionComplete" : "rmsActionReject"
      let app_user_id = this.username;
      let tm_action_id = this.app_session_id;
      let platform = this.getPlatform();
      let req = {
        app_user_id,
        tm_action_id,
        platform
      };
      NonFinancialBusinessController.rmsActionComplete(status,req, ()=>{}, ()=> {});
    },
    populateCookies(req){
      const osName = kony.os.deviceInfo().name.toLocaleLowerCase();
      const platformIn = osName == "android" || osName == "iphone" ? "mobile" : "web";
      //if(platformIn !== this._platform) this.throwCustomError(.PLATFORM_MISMATCH);
      if(this._platform == "web" ){
        this.populateWebCookies(req);
      }else{
        this.populateMobileCookies(req);
      }
    },
    populateWebCookies(req){
      kony.print("Web Flow");
      let decodeCookie = document.cookie.split(";");
      for(var i=0; i<decodeCookie.length; i++) {
        let cookiename = decodeCookie[i].split('=')[0].replace(/\s/g, "");
        if (cookiename === this._tmCookieSid){
          req.tm_session_sid = decodeCookie[i].split('=')[1];
          this.tm_session_id = req.tm_session_sid;
        }
        if (cookiename === this._tmCookieTag){
          req.tm_device_tag = decodeCookie[i].split('=')[1];
          this.tm_device_tag = req.tm_device_tag;
        }
      }
    },
    populateMobileCookies(req){
      kony.print(`HIDNonFinancial ---> Inside Mobile Flow`);     
      let rmsInfo = {};
      var tmCookieTAG = this._tmCookieTag;
      var tmCookieSID = this._tmCookieSid;
      if(!HidRmsSDKManager) this.throwCustomError(nonFinancialConstants.HID_RMS_SDK_MANAGER_MISSING);
      try{
        rmsInfo = JSON.parse(HidRmsSDKManager.getCookieValues(tmCookieTAG,tmCookieSID));
      }catch(e){
        kony.print("HIDRMS => Inside catch rmsLogin exception :"+JSON.stringify(e));
        rmsInfo = {};
      }
      if(Object.keys(rmsInfo).length !==0 && rmsInfo.hasOwnProperty(tmCookieTAG) && rmsInfo.hasOwnProperty(tmCookieSID)){
        req.tm_session_sid = rmsInfo[tmCookieSID];
        req.tm_device_tag = rmsInfo[tmCookieTAG];
        this.tm_session_id = req.tm_session_sid;
        this.tm_device_tag = req.tm_device_tag;
      }
    },

    getPlatform(){
      const osName = kony.os.deviceInfo().name.toLocaleLowerCase();
      const platformIn = osName == "android" || osName == "iphone" ? "mobile" : "web";
      switch(osName){
        case "android": return "android";
        case "iphone" : return "ios";
        default : return "web";
      }    
    },
    mandatoryEventEmitter(event,params, eventName){
      if(!event){
        this.throwCustomError(`${eventName} is not subscribed`);
      }
      event.call(this,params);
    },
    optionalEventEmitter(event, params){
      if(event){
        event.call(this,params);
      }
    },
    throwCustomError : function(msg){
      throw {
        "type": "HID CUSTOM ERROR",
        "message": msg
      };
    }
  };
});