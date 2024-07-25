define(["com/hid/rms/payments/PaymentsBusinessController"],function(PaymentsBusinessController) {
  let platforms = new Set(["web","mobile"]);
  let currencies = new Set(["AFA", "ALL", "DZD", "AOA", "ARS", "AMD", "AWG", "AUD", "AZN", "BSD", "BHD", "BDT", "BBD", "BYR", "BEF", "BZD", "BMD", "BTN", "BTC", "BOB", "BAM", "BWP", "BRL", "GBP", "BND", "BGN", "BIF", "KHR", "CAD", "CVE", "KYD", "XOF", "XAF", "XPF", "CLP", "CNY", "COP", "KMF", "CDF", "CRC", "HRK", "CUC", "CZK", "DKK", "DJF", "DOP", "XCD", "EGP", "ERN", "EEK", "ETB", "EUR", "FKP", "FJD", "GMD", "GEL", "DEM", "GHS", "GIP", "GRD", "GTQ", "GNF", "GYD", "HTG", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "IRR", "IQD", "ILS", "ITL", "JMD", "JPY", "JOD", "KZT", "KES", "KWD", "KGS", "LAK", "LVL", "LBP", "LSL", "LRD", "LYD", "LTL", "MOP", "MKD", "MGA", "MWK", "MYR", "MVR", "MRO", "MUR", "MXN", "MDL", "MNT", "MAD", "MZM", "MMK", "NAD", "NPR", "ANG", "TWD", "NZD", "NIO", "NGN", "KPW", "NOK", "OMR", "PKR", "PAB", "PGK", "PYG", "PEN", "PHP", "PLN", "QAR", "RON", "RUB", "RWF", "SVC", "WST", "SAR", "RSD", "SCR", "SLL", "SGD", "SKK", "SBD", "SOS", "ZAR", "KRW", "XDR", "LKR", "SHP", "SDG", "SRD", "SZL", "SEK", "CHF", "SYP", "STD", "TJS", "TZS", "THB", "TOP", "TTD", "TND", "TRY", "TMT", "UGX", "UAH", "AED", "UYU", "USD", "UZS", "VUV", "VEF", "VND", "YER", "ZMK"]);
  let paymentModes = new Set(["iban", "country_bank", "swift"]);
  let paymentTypes = new Set(["domestic", "foreign", "bank", "own_account"]);
  let securityItemTypes = new Set([ "password", "sms", "mtoken", "grid", "pki", "otp", "access_token", "hw_token", "operator", "other", "none" ]);
  let signatureStates = new Set([ "accepted", "rejected" ]);
  let paymentStates = new Set(["closed_accepted", "closed_rejected"]);
  let paymentsConstants = {};
  paymentsConstants.INVALID_PLATFORM = "Invalid Configuration, platform should be one of web or mobile";
  paymentsConstants.PLATFORM_MISMATCH = "Invalid Configuration, platform mismatch";
  paymentsConstants.INVALID_TM_TAG = "Invalid Configuration, tmCookieTag is incorrect";
  paymentsConstants.INVALID_TM_SID = "Invalid Configuration, tmCookieSid is incorrect";
  paymentsConstants.INVALID_CUR = "Invalid Request,currency type incorrect";
  paymentsConstants.INVALID_PAYMENT_TYPE = `Invalid Request, payment_type must be one of [domestic, foreign, bank, own_account"]`;
  paymentsConstants.INVALID_SOURCE_PAYMENT_MODE = `Invalid Request, source_payment_mode must be one of [iban, country_bank, swift]`;
  paymentsConstants.INVALID_PATNER_PAYMENT_MODE = `Invalid Request, patner_payment_mode must be one of [iban, country_bank, swift]`;
  paymentsConstants.INVALID_REQ_OBJECT = `Request is not type of Object`
  paymentsConstants.INVALID_REQ_MISSING = `Invalid request, missing`;
  paymentsConstants.HID_RMS_SDK_MANAGER_MISSING = `HidRmsSdkManager.js is missing from modules`;
  paymentsConstants.HID_RMS_PAYMENT_DECLINE_TAG = "PAYMENT-DECLINE";
  paymentsConstants.HID_RMS_PAYMENT_ACCEPT_TAG = "PAYMENT-ACCEPT";
  paymentsConstants.DEFAULT_PAYMENT_STATE = "open";
  paymentsConstants.INVALID_SECURITY_ITEM_TYPE = `Invalid request, security_item_type should be one of [ password, sms, mtoken, grid, pki, otp, access_token, hw_token, operator, other, none ]`;
  paymentsConstants.INVALID_SIGNATURE_STATE = `Invalid request, signature_state should be one of [ accepted, rejected ]`;
  paymentsConstants.INVALID_PAYMENT_STATE = `Invalid request, payment_state shoild be one of [closed_accepted, closed_rejected]`;
  let reqBaseTemplate = {
    app_user_id : false,
    amount : false,
    app_payment_id : false,
    currency :  function(str){
      if(currencies.has(str)) return [true];
      return [false, paymentsConstants.INVALID_CUR];
    },
    payment_type : function(str){
      if(paymentTypes.has(str)) return [true];
      return [false, paymentsConstants.INVALID_PAYMENT_TYPE];
    }
  };
  let sourceAccountTemplate = {
    iban :{
      source_iban : false
    },
    country_bank : {
      source_account_number : false,
      source_bank_code : false,
      source_country : false
    },
    swift: {
      source_swift_account_number : false,
      source_swift : false
    }
  }
  let patnerAccountTemplate = {
    iban :{
      patner_iban : false
    }, 
    country_bank : {
      partner_account_number : false,
      patner_bank_code : false,
      patner_country : false
    },
    swift: {
      patner_swift_account_number : false,
      patner_swift : false
    }
  }
  let formReqTemplate = function(sourceAccMode, patnerAccMode){
     let sourceTemplate = sourceAccountTemplate[sourceAccMode];
     let patnerTemplate = patnerAccountTemplate[patnerAccMode];
     let finalTemplate = Object.assign({},sourceTemplate);
     Object.assign(finalTemplate,patnerTemplate);
     Object.assign(finalTemplate,reqBaseTemplate);
     return finalTemplate;
  }
  let validateReq = function(req, temp){
    if(typeof req !== "object")  return [false, paymentsConstants.INVALID_REQ_OBJECT];
    const keys = Object.keys(temp);
    for(const key of keys){
      if(!(key in req)) return  [false, `${paymentsConstants.INVALID_REQ_MISSING} ${key} parameter`];
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
      defineGetter(this, 'customPaymentDeclineTags', () => {
        return this._customPaymentDeclineTags;
      });
      defineSetter(this, 'customPaymentDeclineTags', value => {
        this._customPaymentDeclineTags = value;
      });
      defineGetter(this, 'platform', () => {
        return this._platform;
      });
      defineSetter(this, 'platform', value => {
        if(!platforms.has(value)) this.throwCustomError(paymentsConstants.INVALID_PLATFORM);
        else this._platform = value;
      });
      defineGetter(this, 'tmCookieTag', () => {
        return this._tmCookieTag;
      });
      defineSetter(this, 'tmCookieTag', value => {
        if(!value) this.throwCustomError(paymentsConstants.INVALID_TM_TAG);
        else this._tmCookieTag = value;
      });
      defineGetter(this, 'tmCookieSid', () => {
        return this._tmCookieSid;
      });
      defineSetter(this, 'tmCookieSid', value => {
        if(!value) this.throwCustomError(paymentsConstants.INVALID_TM_SID)
        else this._tmCookieSid = value;
      });
    },
    
    app_session_id : null,
    user_id : null,
    tm_session_id : null,
    tm_device_tag : null,
    app_payment_id : null,
    app_action_id : null,
    paymentCreate : function(request, sourcePaymentMode, patnerPaymentMode, session_id = null){
      if(!paymentModes.has(sourcePaymentMode)) this.throwCustomError(paymentsConstants.INVALID_SOURCE_PAYMENT_MODE);
      if(!paymentModes.has(patnerPaymentMode)) this.throwCustomError(paymentsConstants.INVALID_SOURCE_PAYMENT_MODE);
      let isValidArr = validateReq(request, formReqTemplate(sourcePaymentMode,patnerPaymentMode));
      if(isValidArr[0] == false) this.throwCustomError(isValidArr[1]);
      let finalParams = Object.assign({}, request);
      finalParams.payment_state = paymentsConstants.DEFAULT_PAYMENT_STATE;
      const getSourceAccountId = ()=>{
        switch(sourcePaymentMode){
          case "iban" : return request.source_iban;
          case "country_bank" : return request.source_account_number;
          case "swift" : return request.source_swift_account_number;
        }
      };   
      const getPatnerAccountId = ()=>{
        switch(patnerPaymentMode){
          case "iban" : return request.patner_iban;
          case "country_bank" : return request.partner_account_number;
          case "swift" : return request.patner_swift_account_number;
        }
      }
      this.app_session_id = session_id == null ? Math.floor(Math.random()*100000) : session_id;
      finalParams.source_account_id = getSourceAccountId();
      finalParams.partner_account_id = getPatnerAccountId();
      finalParams.app_session_id = this.app_session_id;
      finalParams.source_account_mode = sourcePaymentMode;
      finalParams.patner_account_mode = patnerPaymentMode;
      finalParams.platform = this.getPlatform();
      this.user_id = finalParams.app_user_id;
      this.app_payment_id = finalParams.app_payment_id;
      this.populateCookies(finalParams);
      kony.print(`HIDPayments ---> FinalParams ${JSON.stringify(finalParams)}`);
      PaymentsBusinessController.paymentCreate(finalParams,this.paymentCreateSuccess, this.paymentCreateFailure);
    },
    paymentCreateSuccess(success){
      kony.print("RMS Payments ---> " + JSON.stringify(success));
      let tags = success.tags;
      if(tags == null){
         this.mandatoryEventEmitter(this.onRMSFailure, "onRMSFailure", success);
         return;
      }
    /*  try{
        tags = JSON.parse(tags);
      }catch(error){
        tags = [];
      }*/
      if(tags.length == 0){
         this.mandatoryEventEmitter(this.onRMSFailure, "onRMSFailure", success);
         return;
      }
    //  let score = success.score;
      let score = success.risk;
      let tagSet = new Set(tags);
      this.app_action_id = success.app_action_id;
      //Custom Tags Check
      let keys = Object.keys(this._customPaymentDeclineTags);
      let paymentDeclineTag = paymentsConstants.HID_RMS_PAYMENT_DECLINE_TAG;
      let paymentAcceptTag = paymentsConstants.HID_RMS_PAYMENT_ACCEPT_TAG
      if(keys.length !== 0){
        for(let key of keys){
           if(tagSet.has(key)){
              this.mandatoryEventEmitter(this.onRMSPaymentDecline, "onRMSPaymentDecline", {tag : key,score});
              return;
           }
        }
      }
      if(tagSet.has(paymentDeclineTag)){
         this.mandatoryEventEmitter(this.onRMSPaymentDecline, "onRMSPaymentDecline", {tag : paymentDeclineTag,score});
         return;
      }
      this.mandatoryEventEmitter(this.onRMSPaymentAccept, "onRMSPaymentAccept", {tag: paymentAcceptTag, score});
    },
    paymentCreateFailure(error){
       this.mandatoryEventEmitter(this.onRMSFailure, "onRMSFailure", error);
    },
    
    //Public Function
    paymentSign : function(security_item_type, signature_state){
       if(!securityItemTypes.has(security_item_type)) this.throwCustomError(paymentsConstants.INVALID_SECURITY_ITEM_TYPE);
       if(!signatureStates.has(signature_state)) this.throwCustomError(paymentsConstants.INVALID_SIGNATURE_STATE);
       let app_session_id = this.app_session_id;
       let tm_device_tag = this.tm_device_tag;
       let tm_session_sid = this.tm_session_id;
       let app_user_id = this.user_id;
       let app_payment_id = this.app_payment_id;
       let payment_state = paymentsConstants.DEFAULT_PAYMENT_STATE;
       let app_action_id = this.app_action_id;
       let platform = this.getPlatform();
       let params = {
          security_item_type,
          signature_state,
          app_session_id,
          tm_device_tag,
          tm_session_sid,
          app_user_id,
          app_payment_id,
          payment_state,
          app_action_id,
          platform
       };
       PaymentsBusinessController.paymentSign(
          params,
          (success)=> this.optionalEventEmitter(this.onRMSSignSuccess, success),
          (error)=> this.optionalEventEmitter(this.onRMSSignSuccess, error)
       )
    },
    
    // Public Function
    paymentUpdate : function(payment_state){
       if(!paymentStates.has(payment_state)) this.throwCustomError(paymentsConstants.INVALID_PAYMENT_STATE);
       let app_action_id = this.app_action_id;
       let app_payment_id = this.app_payment_id;
       let platform = this.getPlatform();
       let params = {
         app_payment_id,
         app_action_id,
         payment_state,
         platform
       };
       PaymentsBusinessController.paymentUpdate(
         params,
         (success)=> {},
         (error)=> {}
       );
    },
    populateCookies(req){
      const osName = kony.os.deviceInfo().name.toLocaleLowerCase();
      const platformIn = osName == "android" || osName == "iphone" ? "mobile" : "web";
      if(platformIn !== this._platform) this.throwCustomError(paymentsConstants.PLATFORM_MISMATCH);
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
     kony.print(`HIDPayments ---> Inside Mobile Flow`);     
     let rmsInfo = {};
     var tmCookieTAG = this._tmCookieTag;
     var tmCookieSID = this._tmCookieSid;
     if(!HidRmsSDKManager) this.throwCustomError(paymentsConstants.HID_RMS_SDK_MANAGER_MISSING);
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
    mandatoryEventEmitter(event, eventName,params){
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