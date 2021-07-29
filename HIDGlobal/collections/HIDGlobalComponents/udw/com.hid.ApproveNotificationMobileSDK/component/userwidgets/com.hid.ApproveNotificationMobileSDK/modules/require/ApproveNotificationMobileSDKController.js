define([`./approveSDKBusinessController`,`./ControllerImplementation`],function(businessController,controllerImplemetation) {
  var sdkConstants = {};
  var contexts = ["Loading","Main","Password","PasswordTimeout"];
  sdkConstants.TITLE_MSG = "Dear #,";
  sdkConstants.STATUS_APPROVE = "accept";
  sdkConstants.STATUS_DENY = "deny";
  sdkConstants.NOTIFY_PASSWORD_MODE = "NOTIFICATION_FLOW";
  sdkConstants.ERROR_PIN = "Invalid PIN";
  sdkConstants.PIN_EMPTY = "Please enter your PIN to continue";
  sdkConstants.PRE_PIN_MESSAGE = "Please enter your PIN to view your transaction";
  sdkConstants.AUTHENTICATION_EXCEPTION = "AuthenticationException";
  var deviceHeight = kony.os.deviceInfo().screenHeight;
  var deviceWidth = kony.os.deviceInfo().screenWidth;
  var heightFactor = 0.060;
  var widthFactor = 0.60;
  var sliderExtraDp = -4;
  var prevX = -1.1;
  var prevXDp = 0;
  var prevXApprove = -1.1;
  var prevXDeny= -1.1;
  var prevXDpApprove = 0;
  var prevXDpDeny = 0;
  var sliderFactor =1;
  var radiusFactor = 0.82;
  var sliderFullWidth= 0;
  var mainFullWidth = 0;
  var centreX = 0;
  var approveCoordinate = 0;
  var denyCoordinate = 0;
  var stopTouchListener = false;
  var stopTouchListenerDeny =false;
  var statusRegistered = "";
  var circleDiameter = 0;
  var circleRadius =0;
  var linesWidthFactor = 0.6;
  var linesHeightFactor = 0.05;
  var approveListenerActive = false;
  var denyListenerActive = false;
  var approveSliderMinLeft = 0;
  var approveSliderMaxRight =0;
  var denySliderMinRight =0;
  var denySliderMaxLeft=0;
  var approveMaxReached = false;
  var denyWidthDx = 0;
  var isAscendingOrder = false;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      // this.view.btnApprove.onClick = source => this.upateStatus(sdkConstants.STATUS_APPROVE);
      //this.view.btnDeny.onClick = source => this.upateStatus(sdkConstants.STATUS_DENY);
      this.view.btnSubmitPasswordTimeout.onClick = this.btnSubmitPasswordTimeOut_onClick;
      this.view.btnSubmitPassword.onClick = this.btnSubmitPassword_onClick;
      this.view.flxConsensusMain.onTouchMove = (source ,x,y,obj) => this.slide(x);
      this.view.flxApproveSliderMain.onTouchMove = (source,x,y,changedObj) => this.approveSlide(x);
      this.view.flxDenySliderMain.onTouchMove = (source,x,y,changedObj) => this.denySlide(x);
      this.view.flxConsensusMain.onTouchEnd = this.resetSlide;
      this.view.flxApproveSliderMain.onTouchEnd = this.resetApproveSlider;
      this.view.flxDenySliderMain.onTouchEnd = this.resetDenySlider; 
      this.view.flxOpaque.onTouchStart = source => {}; //Do Noting event to stop click Liseners of the widgets back of the componenet;
      this.nativeController = new controllerImplemetation(this,baseConfig.id);
      //this.AdjustUI();
      this.adjustUINew();
      //this.contextSwitch("Loading");
      this.setDefaultFeilds();
      //this.postShow = this.setLines();
      this.contextSwitch("Password");
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, "transactionID", () => {
        return this._transactionID;
      });
      defineSetter(this, "transactionID", val => {
        if(!val){
//           throw {
//             "type": "CUSTOM",
//             "message": "Transaction ID property is Invalid"
//           };
        }
        kony.print("ApproveSDK ---> transactionID " + val);
        this._transactionID = val;
        //         if(val){
        //           this.retrievetransactionInfo();
        //         }
      });
    },
    showAuthentication : function(){
      this.view.postShow();
      this.contextSwitch("Password");
      var bioAvailability = this.nativeController.checkForBioAvailability();
      if(bioAvailability){
        var txID = this._transactionID;
        this.nativeController.retriveTransaction(txID,"",true);
      }
    },
    btnSubmitPassword_onClick : function(){
      kony.print("Password Clicked");
      this.view.lblErrorPIN.setVisibility(false);
      if(this.view.tbxPassword.text == "" || this.view.tbxPassword.text == null  || this.view.tbxPassword.text == undefined){
        this.view.lblErrorPIN.text = sdkConstants.PIN_EMPTY;
        this.view.lblErrorPIN.setVisibility(true);
        return;
      }
      var txID = this._transactionID;
      this.contextSwitch("Loading");
      this.nativeController.retriveTransaction(txID,this.view.tbxPassword.text,false);
    },
    retriveTransactionCallback : function(status,message,txInfo){
      kony.print(`ApproveSDK ---> retriveTransactionCallback ${status} ${message} ${txInfo}`);
      if(message == sdkConstants.AUTHENTICATION_EXCEPTION){
        this.view.lblErrorPIN.text = sdkConstants.ERROR_PIN;
        this.view.lblErrorPIN.setVisibility(true);
        this.contextSwitch("Password");
      }
      if(status == "success"){
        let txInfoObj = JSON.parse(txInfo);
        if(txInfoObj.hasOwnProperty("username")){
          let username = txInfoObj.username;
          this.view.lblVerifyTS.text = sdkConstants.TITLE_MSG.replace(/#/,username);
        }
        if(txInfoObj.hasOwnProperty("tds")){
          let tds = txInfoObj.tds;
          this.view.lblTDS.text = tds;
        }
        this.contextSwitch("Main");
      }
    },
    retrieveTransactionIds : function(isAscendingFlag){
        isAscendingOrder = isAscendingFlag;
        kony.print("ApproveSDK --> isAscendingOrder in ApproveNotification"+isAscendingOrder);
        this.nativeController.retrievePendingNotifications();
    },    
    onRecievedNotificationsCallback : function(message,ids){
      if(message == "success"){
        var obj = JSON.parse(ids);
        var txIDArray = obj.txIDs;
      if(isAscendingOrder){
        txIDArray.reverse();
      }
        this.commonEventEmitter(this.onRetrieveNotificationsCallback,[message,txIDArray]);       
      }
      else{
        this.commonEventEmitter(this.onRetrieveNotificationsCallback,[message]); 
      }
    },
    onCompletionCallback : function(status){
      this.view.tbxPassword.text = "";
      this.view.tbxPasswordTimeout = "";
      kony.print("ApproveSDK ----> Success Status is "+status)
      this.resetSlide();
      this.commonEventEmitter(this.onCompletion, [statusRegistered]);
      statusRegistered = "";
    },
    pwdPromtCallback : function(eventType,eventCode){
      if(eventCode == "5001"){
        this.view.lblErrorPINTimeout.text = sdkConstants.ERROR_PIN;
        this.view.lblErrorPINTimeout.setVisibility(true);
      }
      this.contextSwitch("PasswordTimeout");
    },
    btnSubmitPasswordTimeOut_onClick : function(){
      kony.print("Timeout Clicked");
      this.view.lblErrorPINTimeout.setVisibility(false);
      var pwd = this.view.tbxPasswordTimeout.text;
      if(!pwd || pwd === ""){
         this.view.lblErrorPINTimeout.text = sdkConstants.PIN_EMPTY;
         this.view.lblErrorPINTimeout.setVisibility(true);
         return;
      }
//       this.nativeController.notifyPassword(pwd,sdkConstants.NOTIFY_PASSWORD_MODE);
        this.contextSwitch("Loading");
        var txID = this._transactionID;
        kony.print("ApproveSDK ---> Pwd from Viz is " + pwd);
        kony.print("ApproveSDK Status ---> " + statusRegistered);
        this.nativeController.setNotificationStatus(txID,statusRegistered,pwd);
    },
    upateStatus : function(status){
      var txID = this._transactionID;
      kony.print("ApproveSDK ---> upateStatus _transactionID " + txID);
      this.contextSwitch("Loading");
      this.nativeController.setNotificationStatus(txID,status,"");
      
    },
    AdjustUI(){
      let height = Math.floor(deviceHeight * heightFactor);
      let width = Math.floor(deviceWidth * widthFactor);
      mainFullWidth = width;
      this.view.flxConsensusMain.height = height + "dp";
      this.view.flxConsensusMain.width = width + "dp";
      let sliderHeight = height + sliderExtraDp;
      let sliderWidth = sliderHeight;
      approveCoordinate = Math.ceil(sliderWidth/2);
      denyCoordinate = Math.ceil(width - sliderWidth/2);
      sliderFullWidth = sliderWidth;
      sliderFactor = Math.floor(width/sliderWidth);
      kony.print("AdjustUI ---> sliderFactor " + sliderFactor);
      kony.print("AdjustUI ---> sliderWidth " + sliderWidth);
      this.view.flxSlider.height = sliderHeight + "dp";
      this.view.flxSlider.width = sliderWidth + "dp";
      let sliderX = Math.floor((deviceWidth/2)-sliderWidth/2);
      centreX = Math.ceil(width/2);
      prevXDp = sliderX;
      kony.print("AdjustUI ---> sliderX" + sliderX);
      this.view.flxSlider.centerX = sliderX + "dp";
    },
    adjustUINew : function(){
       let height = Math.floor(deviceHeight * heightFactor);
       let width = Math.floor(deviceWidth * widthFactor);
       mainFullWidth = width;
       this.view.flxApproveSliderMain.height = height + "dp";
       this.view.flxApproveSliderMain.width = width + "dp";
       this.view.flxDenySliderMain.height = height + "dp";
       this.view.flxDenySliderMain.width = width + "dp"; 
       circleDiameter = Math.floor((height * radiusFactor)-3);
       this.view.flxCircleApprove.height = circleDiameter + "dp";
       this.view.flxCircleApprove.width = circleDiameter + "dp";
       this.view.flxCircleDeny.height = circleDiameter + "dp";
       this.view.flxCircleDeny.width = circleDiameter + "dp";
       this.view.flxApproveDarkNew.height = circleDiameter + "dp"
       this.view.flxDenyDarkNew.height = circleDiameter + "dp";
       let circleLeft = Math.ceil((height - circleDiameter)/2);
       circleRadius = Math.floor(circleDiameter/2);
       kony.print("AdjustUI ---> circleLeft" +circleLeft );
       kony.print("AdjustUI ---> circleRadius" +circleRadius);
       this.view.flxCircleApprove.centerX= (circleLeft + circleRadius) + "dp";
       this.view.flxApproveDarkNew.left = circleLeft +"dp";
       this.view.flxDenyDarkNew.right = circleLeft + "dp";
       this.view.flxCircleDeny.centerX = (width - circleLeft - circleRadius) + "dp"; //-1
       approveSliderMinLeft = circleLeft;
       approveSliderMaxRight = circleLeft + circleDiameter;
       denySliderMinRight = width-circleLeft;
       denySliderMaxLeft = width-circleDiameter-circleLeft;
       prevXDpApprove = circleLeft + circleRadius;
       prevXDpDeny = width - circleLeft - circleRadius;
       let upLineWidth = Math.floor(linesWidthFactor*circleDiameter*Math.sin(Math.PI/4));
       let upLineHeight = Math.floor(linesHeightFactor*circleDiameter);
       let upLineLeft = Math.ceil((circleDiameter - upLineWidth)/2)+1;
       let downLineWidth = upLineWidth-upLineHeight+1;
       let downLineHeight = upLineHeight;
       let downLineLeft = upLineLeft-upLineHeight;
       this.view.flxApproveLineUp.width = upLineWidth + "dp";
       this.view.flxApproveLineUp.height = upLineHeight + "dp";
       this.view.flxApproveLineUp.left = upLineLeft + "dp";
       this.view.flxApproveLineDown.width = downLineWidth + "dp";
       this.view.flxApproveLineDown.height = downLineHeight + "dp";
       this.view.flxApproveLineDown.left = downLineLeft + "dp";
       this.view.flxDenyLineUp.width = upLineWidth + "dp";
       this.view.flxDenyLineUp.height = upLineHeight + "dp";
       this.view.flxDenyLineUp.left = upLineLeft + "dp";
       this.view.flxDenyLineDown.width = downLineWidth + "dp";
       this.view.flxDenyLineDown.height = downLineHeight + "dp";
       this.view.flxDenyLineDown.left = downLineLeft + "dp";  
       approveCoordinate = mainFullWidth-circleLeft-circleRadius;
       denyCoordinate = circleRadius + circleLeft;
       denyWidthDx = (mainFullWidth - circleLeft - circleRadius);
    },
    checkCordinates : function(){
      if(statusRegistered !=""){
        this.contextSwitch("Loading");
        this.upateStatus(sdkConstants.STATUS_DENY);     
      }
    },
    slide : function(x){
      if(stopTouchListener){
        return
      }
      kony.print("AdjustUI ---> sliderX" + x);
      var sliderLeftLimit = (mainFullWidth/2)-(sliderFullWidth/2);
      var sliderRightLimit = (mainFullWidth/2)+(sliderFullWidth/2);
      if(prevX === -1.1){
        kony.print("AdjustUI ---> minX " + sliderLeftLimit);
        kony.print("AdjustUI ---> MaxX " + sliderRightLimit);
        if(x < sliderLeftLimit || x > sliderRightLimit){
          return;
        }
        prevX = x;
      }
      if(x <= approveCoordinate){
        stopTouchListener =true;
        statusRegistered = sdkConstants.STATUS_APPROVE;
        //this.contextSwitch("Loading");
        this.upateStatus(sdkConstants.STATUS_APPROVE);
        return;
      }
      if(x >= denyCoordinate){
        stopTouchListener =true;
       // this.contextSwitch("Loading");
        statusRegistered = sdkConstants.STATUS_DENY;
        this.upateStatus(sdkConstants.STATUS_DENY);
        return;
      }
      let polarDx = prevX - x;
      kony.print("AdjustUI ---> polarDx " + polarDx);
      let dx = (prevXDp - polarDx);
      kony.print("AdjustUI ---> dx " + dx);
      if(x < sliderLeftLimit){
        this.view.flxSlider.skin = "sknSliderApprove";
        this.view.flxApproveDark.width = Math.floor(centreX-dx+(sliderFullWidth/2)) + "dp"; //+width.substring(0,width.lenth-2) +  Math.abs(dw) + "dp";
      }else if(x > sliderRightLimit){
        this.view.flxSlider.skin = "sknSliderDeny";
        this.view.flxDenyDark.width = Math.floor(dx-centreX-(sliderFullWidth/2)) + "dp";//+width.substring(0,width.lenth-2) +  dw + "dp";
      }else{
        this.view.flxSlider.skin = "sknSliderNormal";
      }
      this.view.flxSlider.centerX  = dx + "dp";
      prevXDp = dx;
      prevX = x;
    },
    approveSlide : function(x){
       if(stopTouchListener ){
         kony.print("AdjustUI ---> Approve coordinate is" + approveCoordinate);
         this.view.flxCircleApprove.centerX  = approveCoordinate + "dp";
         this.view.flxApproveDarkNew.width = (approveCoordinate-circleRadius)+"dp";
        return;
      }
      if(denyListenerActive){
        return;
      }
      kony.print("AdjustUI ---> sliderX" + x);
      approveListenerActive = true;
      var sliderLeftLimit = approveSliderMinLeft;
      var sliderRightLimit = approveSliderMaxRight;
      if(prevXApprove === -1.1){
        kony.print("AdjustUI ---> minX " + sliderLeftLimit);
        kony.print("AdjustUI ---> MaxX " + sliderRightLimit);
        if(x < sliderLeftLimit || x > sliderRightLimit){
          return;
        }
        prevXApprove = x;
      }
      if(x >= approveCoordinate){
        stopTouchListener =true;
      //  statusRegistered = sdkConstants.STATUS_APPROVE;
       // this.upateStatus(sdkConstants.STATUS_APPROVE);
      }
      let polarDx = prevXApprove- x;
      kony.print("AdjustUI ---> polarDx " + polarDx);
      let dx = (prevXDpApprove - polarDx);
      kony.print("AdjustUI ---> dx " + dx);
      if(x > sliderRightLimit){
        this.view.flxCircleApprove.skin = "sknApproveFlxFocus";
        this.view.flxApproveLineUp.skin = "sknApproveLineFocus";
        this.view.flxApproveLineDown.skin = "sknApproveLineFocus";
        this.view.flxApproveDarkNew.width = dx + circleRadius-approveSliderMinLeft + "dp";
      }else{
        return;
      }
      this.view.flxCircleApprove.centerX  = dx + "dp";
      prevXDpApprove = dx;
      prevXApprove = x;
      if(stopTouchListener){
        statusRegistered = sdkConstants.STATUS_APPROVE;
        this.upateStatus(sdkConstants.STATUS_APPROVE);
      }
    },    
    denySlide : function(x){
       if(stopTouchListenerDeny){
         this.view.flxCircleDeny.centerX  = denyCoordinate+"dp";
         this.view.flxDenyDarkNew.width = (mainFullWidth- denyCoordinate + approveSliderMinLeft)+ "dp";
        return;
      }
      if(approveListenerActive){
         return;
       }
      kony.print("AdjustUI ---> sliderX" + x);
      denyListenerActive = true;
      var sliderLeftLimit = denySliderMaxLeft;
      var sliderRightLimit = denySliderMinRight;
      if(prevXDeny === -1.1){
        kony.print("AdjustUI ---> minX " + sliderLeftLimit);
        kony.print("AdjustUI ---> MaxX " + sliderRightLimit);
        if(x < sliderLeftLimit || x > sliderRightLimit){
          return;
        }
        prevXDeny = x;
      }
      if(x <= denyCoordinate){
        kony.print("De")
        stopTouchListenerDeny =true;
      }
      let polarDx = prevXDeny - x;
      kony.print("AdjustUI ---> polarDx " + polarDx);
      let dx = ( prevXDpDeny - polarDx);
      kony.print("AdjustUI ---> dx " + dx);
      if(x < sliderLeftLimit){
        this.view.flxCircleDeny.skin = "sknDenyFlxFocus";
        this.view.flxDenyLineUp.skin = "sknDenyLineFocus";
        this.view.flxDenyLineDown.skin = "sknDenyLineFocus";
        this.view.flxDenyDarkNew.width = (mainFullWidth- dx)+approveSliderMinLeft;//( dx + circleRadius-approveSliderMinLeft)) + "dp";
      }else{
        return;
      }
      this.view.flxCircleDeny.centerX  = dx;//denyWidthDx-dx + "dp";
      kony.print("AdjustUI ---> WidthDx " + denyWidthDx);
      kony.print("AdjustUI ---> mainFullWidth " + mainFullWidth);
      kony.print("AdjustUI ---> newDx " + (denyWidthDx - dx));
      prevXDpDeny = dx;
      prevXDeny = x;
      denyWidthDx -= dx;
      if(stopTouchListenerDeny){
        statusRegistered = sdkConstants.STATUS_DENY;
        this.upateStatus(sdkConstants.STATUS_DENY);
      }
    },
    resetSlide : function(){
//       this.view.flxSlider.skin = "sknSliderNormal";
//       let sliderX = Math.floor((deviceWidth/2)-sliderFullWidth/2);
//       prevXDp = sliderX;
//       prevX =-1.1;
//       kony.print("AdjustUI ---> sliderX" + sliderX);
//       this.view.flxSlider.centerX = sliderX + "dp";
//       this.view.flxApproveDark.width = "0dp";
//       this.view.flxDenyDark.width = "0dp";
//       stopTouchListener = false;
      //statusRegistered = "";
      this.resetApproveSlider();
      this.resetDenySlider();
    },
    resetDenySlider : function(){
      prevXDpDeny = mainFullWidth - approveSliderMinLeft - circleRadius;// = mainFullWidth-circleDiameter-approveSliderMinLeft;
      prevXDeny =-1.1;
      denyWidthDx =  (mainFullWidth - approveSliderMinLeft - circleRadius);
      this.view.flxCircleDeny.centerX= (mainFullWidth - approveSliderMinLeft - circleRadius) + "dp";
      this.view.flxDenyDarkNew.width = "0dp";
      this.view.flxCircleDeny.skin = "sknDenyFlxNormal";
      this.view.flxDenyLineUp.skin = "sknApproveLineNormal";
      this.view.flxDenyLineDown.skin = "sknApproveLineNormal";
      stopTouchListenerDeny = false;
      denyListenerActive = false;
    },
    resetApproveSlider : function(){
      prevXDpApprove = approveSliderMinLeft + circleRadius;
      prevXApprove =-1.1;
      this.view.flxCircleApprove.centerX= (approveSliderMinLeft + circleRadius) + "dp";
      this.view.flxApproveDarkNew.width = "0dp";
      this.view.flxCircleApprove.skin = "sknApproveFlxNormal";
      this.view.flxApproveLineUp.skin = "sknApproveLineNormal";
      this.view.flxApproveLineDown.skin = "sknApproveLineNormal";
      stopTouchListener = false;
      approveMaxReached = false;
      approveListenerActive = false;
    },
    approveSlider_onTouchEnd: function(){
      this.resetApproveSlider();
    },
    setDefaultFeilds : function(){
       this.view.lblPwd.text = sdkConstants.PRE_PIN_MESSAGE;
    },
    contextSwitch : function(context){
      for(let i of contexts){
        this.view[`flx${i}`].setVisibility(i === context);
      }
    },
    commonEventEmitter(event,args){
      if(event){
        event.apply(this,args);
      }
    }
  };
});