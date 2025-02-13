define([`./approveSDKBusinessController`,`./ControllerImplementation`],function(businessController,controllerImplemetation) {
  var sdkConstants = {};
  var contexts = ["Loading","Main","Password","PasswordTimeout","UpdatePassword"];
  sdkConstants.TITLE_MSG = "Dear #,";
  sdkConstants.STATUS_APPROVE = "accept";
  sdkConstants.STATUS_DENY = "deny";
  sdkConstants.NOTIFY_PASSWORD_MODE = "NOTIFICATION_FLOW";
  sdkConstants.ERROR_PIN = `PIN is incorrect`; 
  sdkConstants.PIN_EMPTY = "Please enter your PIN to continue";
  sdkConstants.PRE_PIN_MESSAGE = "Please enter your PIN to view your transaction";
  sdkConstants.AUTHENTICATION_EXCEPTION = "AuthenticationException";
  sdkConstants.ERROR_PWD_NOT_ENTERED = `Please enter PIN`;
  sdkConstants.ERROR_PWD_NOT_MATCH = `Entered PINs do not match`;
  sdkConstants.ERROR_PIN = `PIN is incorrect`; 
  sdkConstants.ERROR_SAME_PIN = `New PIN cannot be same as old PIN`;
  sdkConstants.ERROR_NEW_PWD_NOT_ENTERED = `Please enter the new PIN`;
  sdkConstants.ERROR_CNF_PWD = "Please confirm the new PIN";
  sdkConstants.ERROR_PWD_MATCH = `New PIN cannot be same as old PIN`;
  sdkConstants.ERROR_MESSAGE =`Password change is required`;
  sdkConstants.TRANSACTION_EXPIRED = "Transaction is Expired!";
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
  var linesHeightDelta = -1;
  var linesWidthDelta = 1;
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      // this.view.btnApprove.onClick = source => this.upateStatus(sdkConstants.STATUS_APPROVE);
      //this.view.btnDeny.onClick = source => this.upateStatus(sdkConstants.STATUS_DENY);
      this.view.btnSubmitPasswordTimeout.onClick = this.btnSubmitPasswordTimeOut_onClick;
      this.view.btnSubmitPassword.onClick = this.btnSubmitPassword_onClick;
      this.view.btnOKAlert.onClick = this.btnOKAlert_onClick;
      this.view.flxConsensusMain.onTouchMove = (source ,x,y,obj) => this.slide(x);
      this.view.flxApproveSliderMain.onTouchMove = (source,x,y,changedObj) => this.approveSlide(x);
      this.view.flxDenySliderMain.onTouchMove = (source,x,y,changedObj) => this.denySlide(x);
      this.view.flxConsensusMain.onTouchEnd = this.resetSlide;
      this.view.flxApproveSliderMain.onTouchEnd = this.resetApproveSlider;
      this.view.flxDenySliderMain.onTouchEnd = this.resetDenySlider;
      this.view.btnUpdatePIN.onClick = this.btnUpdatePIN_onClick;
      this.view.flxUpdatePassword.setVisibility(false);
      this.view.setVisibility(true);
      this.view.flxIosBack.setVisibility(false);
      this.view.flxOpaque.onTouchStart = source => {}; //Do Noting event to stop click Liseners of the widgets back of the componenet;
      if(!this.isAndroid()){
         this.view.flxIosBack.onTouchEnd = source => this.onCompletionCallback(false);
      }
      this.nativeController = new controllerImplemetation(this,baseConfig.id);
      //this.AdjustUI();
      this.adjustUINew();
      //this.contextSwitch("Loading");
      this.setDefaultFeilds();
      //this.postShow = this.setLines();
      this.contextSwitch("Password");
    },
    //Logic for getters/setters of custom properties
    username : "",
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
      });
    },
    showAuthentication: function(){
      this.contextSwitch("Loading");
      var txID = this._transactionID;
      this.nativeController.retriveTransaction(txID,"",true);
      /*
        if(!this.isAndroid()){
           let randomTimer = Math.floor(Math.random()*1000);
    	   let timer = `timer${randomTimer}`;
           kony.timer.schedule(timer,()=>{
             var txID = this._transactionID;
             let str = this.nativeController.retriveTransaction(txID,"",true);
            kony.print(`ApproveSDK --> Value for str from retrieveTransaction: ${str}`);
             if(str == "false"){
                this.contextSwitch("Password");
             }
           },0.5,false); 
        }else{
          var txID = this._transactionID;
         // this.contextSwitch("Password");
          this.nativeController.retriveTransaction(txID,"",true);
        }*/
      
    },
    btnSubmitPassword_onClick: function(){
      kony.print("Password Clicked");
      this.view.lblErrorPIN.setVisibility(false);
      if(this.view.tbxPassword.text == "" || this.view.tbxPassword.text == null  || this.view.tbxPassword.text == undefined){
        this.view.lblErrorPIN.text = sdkConstants.PIN_EMPTY;
        this.view.lblErrorPIN.setVisibility(true);
        return;
      }
      var txID = this._transactionID;
      this.contextSwitch("Loading");
      this.view.tbxPassword.text = "";
      this.nativeController.retriveTransaction(txID,this.view.tbxPassword.text,false);
    },
    retriveTransactionCallback: function(status,message,txInfo){
      this.view.tbxPassword.text = "";
      kony.print(`ApproveSDK ---> retriveTransactionCallback ${status} ${message} ${txInfo}`);
      if(status == "error"){
        this.contextSwitch("UpdatePassword");
      }
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
        this.view.postShow();
        this.contextSwitch("Main");
        if(this.view.isVisible === false){
          this.view.setVisibility(true);
        }
		kony.print("ApproveSDK --> Flow Completed");
        this.view.forceLayout();
      }
    },
    retrieveTransactionIds: function(username,isAscendingFlag = true){
        if(username){
          this.nativeController.updateUsername(username);
        }
        isAscendingOrder = isAscendingFlag;
        kony.print("ApproveSDK --> isAscendingOrder in ApproveNotification"+isAscendingOrder);
        this.nativeController.retrievePendingNotifications();
    },    
    onRecievedNotificationsCallback: function(message,ids){
      kony.print("message in recievedNotificationCallback: "+message);
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
    onCompletionCallback: function(status){
      this.view.tbxPassword.text = "";
      this.view.tbxPasswordTimeout.text = "";
      kony.print("ApproveSDK ----> Success Status is "+status)
      this.resetSlide();
      this.view.setVisibility(false);
      this.commonEventEmitter(this.onCompletion, [statusRegistered]);
      statusRegistered = "";
    },
    pwdPromtCallback: function(eventType,eventCode){
      kony.print(`In pwdPromtCallback with eventCode: ${eventCode} and eventType: ${eventType}`);
      if(eventCode == "5002"){
        this.contextSwitch("UpdatePassword");
      }
      if(eventCode == "5001"){
        this.view.lblErrorPINTimeout.text = sdkConstants.ERROR_PIN;
        this.view.lblErrorPINTimeout.setVisibility(true);
        this.contextSwitch("PasswordTimeout");
      }
      if(eventCode == "5000"){
        this.contextSwitch("PasswordTimeout");
      }
      if(eventCode == "1000"){
        this.view.flxLoading.setVisibility(false);
        this.view.flxMain.setVisibility(false);
        this.view.flxPassword.setVisibility(false);
        this.view.flxPasswordTimeout.setVisibility(false);
        this.view.forceLayout();
        this.view.lblAlertMessage.text = sdkConstants.TRANSACTION_EXPIRED;
        this.view.flxAlertBox.setVisibility(true);
        this.view.forceLayout();
      }
    },
    btnOKAlert_onClick: function(){
      this.view.tbxPassword.text = "";
      this.view.tbxPasswordTimeout.text = "";
      kony.print("ApproveNotificationMobileSDK ----> Button Ok Clicked");
      this.view.flxAlertBox.setVisibility(false);
      this.view.setVisibility(false);
      this.view.forceLayout();
    },
    btnSubmitPasswordTimeOut_onClick: function(){
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
       if(!this.isAndroid()){
          kony.print("ApproveSDK ---> IOS device");
          heightFactor = 0.05;
          linesHeightFactor = 0.05;
          linesWidthDelta = 2;
          linesHeightDelta = 0;
       }
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
       let upLineWidth = Math.ceil(linesWidthFactor*circleDiameter*Math.sin(Math.PI/4));
       let upLineHeight = Math.ceil(linesHeightFactor*circleDiameter) + linesHeightDelta;
       let upLineLeft = Math.ceil((circleDiameter - upLineWidth)/2)+1;
       let downLineWidth = upLineWidth-upLineHeight +linesWidthDelta;
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
    ////////   Update Password method called here .............
    btnUpdatePIN_onClick : function(){
      kony.print("ApproveSDK ---> btnUpdatePIN_onClick");
      this.showErrorPassword(false, "");
      this.setLoadingScreen(true)
      
      if(!this.passwordPolicy){
        kony.print("HIDSDK => Fetching getPasswordPolicy");
        var policy = this.nativeController.getPasswordPolicy();
 
        if(policy) {
          this.passwordPolicy = JSON.parse(policy) || {};
          kony.print(JSON.stringify(this.passwordPolicy)); 
        }
        kony.print("ApproveSDKWrapper this.PasswordPolicy:"+JSON.stringify(this.passwordPolicy));                
      }

      let oldPwd = this.view.tbxCurrentPIN.text;
      let newPwd = this.view.tbxNewPIN.text;
      let cnfPwd = this.view.tbxConfirmUpdPwd.text;
      
      if(oldPwd == "" || oldPwd == " " || oldPwd == undefined || oldPwd === null){
        let error = sdkConstants.ERROR_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(newPwd == "" || newPwd == " " || newPwd == undefined || newPwd === null){
        let error = sdkConstants.ERROR_NEW_PWD_NOT_ENTERED;
        this.showErrorPassword(true,error);
        return;
      }
      if(cnfPwd == "" || cnfPwd == " " || cnfPwd == undefined || cnfPwd === null){
        let error = sdkConstants.ERROR_CNF_PWD;
        this.showErrorPassword(true,error);
        return;
      }
      if(oldPwd == newPwd ){ 
        let error = sdkConstants.ERROR_PWD_MATCH;
        this.showErrorPassword(true,error);
        return;
      }
      if(newPwd != cnfPwd){
        let error = sdkConstants.ERROR_PWD_NOT_MATCH;
        this.showErrorPassword(true,error);
        return;
      }
      
      this.password = newPwd;
      kony.print("ApproveSDKWrapper : "+this.checkPasswordPolicy(newPwd));

      if(this.checkPasswordPolicy(newPwd)){      
        kony.print("ApproveSDKWrapper Updating my Password");
        this.nativeController.updatePassword(oldPwd,newPwd);
      }
    }, 
    updatePwdCallbackInternalComponent : function(exceptionType,message){
      kony.print("ApproveSDK ---> updatePwdCallbackInternalComponent with exceptionType: "+exceptionType);
      kony.print("ApproveSDK ---> updatePwdCallbackInternalComponent with message: "+message);
      if(exceptionType === "UpdatePassword"){
        if(message === "updateSuccess"){
          this.view.flxErrorPwdPR.setVisibility(false);
          this.view.flxUpdatePassword.setVisibility(false);
          this.view.flxOpaque.setVisibility(false);
          this.view.setVisibility(false);
          this.setLoadingScreen(false);

          if(this.onUpdatePasswordCB){ 
//             this.onUpdatePasswordCB("success");
            this.commonEventEmitter(this.onUpdatePasswordCB,["success"]);
          } 
        }
      } else if(exceptionType === "InvalidPasswordException"){
        this.view.flxErrorPwdPR.setVisibility(true);
        if(message === "Same password prohibited")
        {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_SAME_PIN;
        }
        else if(message == "Password change is too soon (minimum age 1, current 0 days)")
        {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_PIN_CHANGE;
        }else {
          this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_GENERIC;
        }

        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("invalidPassword");
        }
      } else if(exceptionType === "AuthenticationException"){
          this.view.flxErrorPwdPR.setVisibility(true);
          if(message ==="Password is incorrect")
          {
            this.setLoadingScreen(false);
            this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_PIN;
          }else {
            this.view.lblErrorPasswordPR.text = sdkConstants.ERROR_GENERIC;
          }
          if(this.onUpdatePasswordCB){
            this.onUpdatePasswordCB("invalidPassword");
          }
      } else {
        if(this.onUpdatePasswordCB){
          this.onUpdatePasswordCB("error");
//           this.commonEventEmitter(this.onUpdatePasswordCB,["error"]);
        }
      }
    },
    checkPasswordPolicy : function(pwd){
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && +this.passwordPolicy.minAlpha === 0){
        return this.checkPinPolicy(pwd);
      }
      let noOfAlpha = this.countAlphacountAlphabets(pwd);
      let noOfNumeric = this.countNumeric(pwd);
      let noOfLowerCase = this.countLowerCase(pwd);
      let noOfUpperCase = this.countUpperCase(pwd);
      let noOfSpl = this.countSplCharacter(pwd);
      if(this.passwordPolicy.hasOwnProperty("minLength") && pwd.length < +this.passwordPolicy.minLength){
        let error = sdkConstants.ERROR_PWD_MIN_SPL.replace(/#/,this.passwordPolicy.minLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxLength") && pwd.length > +this.passwordPolicy.maxLength){
        let error = sdkConstants.ERROR_LENGTH_MAX.replace(/#/,this.passwordPolicy.maxLength );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minAlpha") && noOfAlpha < +this.passwordPolicy.minAlpha){
        let error = sdkConstants.ERROR_PWD_MIN_ALPHA.replace(/#/,this.passwordPolicy.minAlpha );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxAlpha") && noOfAlpha > +this.passwordPolicy.maxAlpha){
        let error = sdkConstants.ERROR_PWD_MAX_ALPHA.replace(/#/,this.passwordPolicy.maxAlpha );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minNumeric") && noOfNumeric < +this.passwordPolicy.minNumeric){
        let error = sdkConstants.ERROR_PWD_MIN_NUM.replace(/#/,this.passwordPolicy.minNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && noOfNumeric > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_PWD_MAX_NUM.replace(/#/,this.passwordPolicy.maxNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minUpperCase") && noOfUpperCase < +this.passwordPolicy.minUpperCase){
        let error = sdkConstants.ERROR_PWD_MIN_UPPER.replace(/#/,this.passwordPolicy.minUpperCase );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxUpperCase") && noOfUpperCase > +this.passwordPolicy.maxUpperCase){
        let error = sdkConstants.ERROR_PWD_MAX_UPPER.replace(/#/,this.passwordPolicy.maxUpperCase );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minLowerCase") && noOfLowerCase < +this.passwordPolicy.minLowerCase){
        let error = sdkConstants.ERROR_PWD_MIN_LOWER.replace(/#/,this.passwordPolicy.minLowerCase );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxLowerCase") &&  noOfLowerCase > +this.passwordPolicy.maxLowerCase){
        let error = sdkConstants.ERROR_PWD_MAX_LOWER.replace(/#/,this.passwordPolicy.maxLowerCase );
        this.showErrorPassword(true,error); 
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minSpl") && noOfSpl < +this.passwordPolicy.minSpl){
        let error = sdkConstants.ERROR_PWD_MIN_SPL.replace(/#/,this.passwordPolicy.minSpl );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxSpl") && noOfSpl > +this.passwordPolicy.maxSpl){
        let error = sdkConstants.ERROR_PWD_MAX_SPL.replace(/#/,this.passwordPolicy.maxSpl );
        this.showErrorPassword(true,error);
        return false;
      }
    },
    seqCheckPin: function(numberString) {
      if(this.sameSequence(numberString)){
        return true;
      }
      if(this.haveSequence(numberString)){
        return true;
      }
      return false;
    },
    sameSequence : function(s){
      let count = 0;
      let cur = 0;
      let prev = 0;
      let l = s.length;
      for(let i = 1;i < l;i++){
        cur = +s[i];
        prev = +s[i-1];
        if (cur-prev === 0){
          count += 1;
          }
        else{
          count = 0;
          }

        if (count === 3){
          return true;
          }
        }
      return false;
    },
    haveSequence : function(s){
      let l = s.length;
      let one = 0;
      let negativeone = 0;
      let cur = 0;
      let prev = 0;
      let currem = 0;
      let prevrem = 0;
      for(let i = 1;i < l; i ++){
        cur = +s[i];
        prev = +s[i-1];
        if(i < 4){
          if (cur - prev === 1){
            one += 1;
            }
          else if (cur - prev === -1){
            negativeone += 1;
            }
          }
        else{
          currem = +s[i-3];
          prevrem = +s[i-4];
          if (currem - prevrem === 1){
            one -= 1;
            }
          else if (currem - prevrem === -1){
            negativeone -= 1;
            }
          if (cur - prev === 1){
            one += 1;
            }
          else if (cur - prev === -1){
            negativeone += 1;
            }
          }
        if (one === 3 || negativeone === 3){
          return true;
          }
        }
      return false;
    },
    checkPinPolicy : function(pin){
      kony.print("Inside checkPinPolicy method")
      let isSequencePresent = this.seqCheckPin(pin);
//       alert(isSequencePresent);
      if(isNaN(pin)){
        let error = sdkConstants.ERROR_PWD_NO_ALPHA;
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("minNumeric") && pin.length < +this.passwordPolicy.minNumeric){
        let error = sdkConstants.ERROR_LENGTH_MIN_PIN.replace(/#/,this.passwordPolicy.minNumeric );
        this.showErrorPassword(true,error);
        return false;
      }
      if(this.passwordPolicy.hasOwnProperty("maxNumeric") && pin.length > +this.passwordPolicy.maxNumeric){
        let error = sdkConstants.ERROR_LENGTH_MAX_PIN.replace(/#/,this.passwordPolicy.maxNumeric );
        this.showErrorPassword(true,error);
        return false;
      }      
      if((isSequencePresent)){
        let error = "no sequential characters allowed";
        this.showErrorPassword(true,error);
        return false;
      }
      return true;
    },
    countAlphabets : function(pwd){
      return  pwd.replace(/[^a-zA-Z]/g, '').length;
    },
    countNumeric : function(pwd){
      return  pwd.replace(/[^0-9]/g, '').length;
    },
    countUpperCase : function(pwd){
      return pwd.replace(/[^A-Z]/g,'').length;
    },
    countLowerCase : function(pwd){
      return pwd.replace(/[^a-z]/g,'').length;
    },
    countSplCharacter : function(pwd){
      return pwd.replace(/[a-zA-Z0-9]/g,'').length;
    },
    showErrorPassword : function(visible,message = 'Please enter PIN'){
      if(visible){
        this.view.lblErrorPasswordPR.text = message;
      }
      this.view.flxErrorPwdPR.setVisibility(visible);
      this.setLoadingScreen(false);
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
    resetUpdatePasswordUI : function(){
      this.view.tbxCurrentPIN.text = "";
      this.view.tbxNewPIN.text = "";
      this.view.tbxConfirmUpdPwd.text = "";
      this.showUpdatePINError(false);
      this.view.flxMainUpdatePwd.setVisibility(true);
      // this.view.flxUpdatePwdSuccess.setVisibility(false);
    },
    showUpdatePINError : function(visible,msg = ""){
      this.view.lblErrorPasswordPR.text  = msg;
      this.view.flxErrorPwdPR.setVisibility(visible);
      this.view.forceLayout();
    },
    approveSlider_onTouchEnd: function(){
      this.resetApproveSlider();
      this.resetUpdatePasswordUI();
    },
    setDefaultFeilds : function(){
       this.view.lblPwd.text = sdkConstants.PRE_PIN_MESSAGE;
    },
    contextSwitch : function(context){
      kony.print(`ApproveSDK --> Inside contextSwitch with context: ${context}`);
      for(let i of contexts){
        this.view[`flx${i}`].setVisibility(i === context);
      }
      kony.print("ApproveSDK -->  context isVisible:"+ this.view[`flx${context}`].isVisible);
      kony.print(`ApproveSDK -->  ApproveNotificationMobileSDK isVisible: ${this.view.isVisible}`);
      this.view.forceLayout();
    },
    isAndroid : function(){
       var deviceInfo = kony.os.deviceInfo();
       return deviceInfo.name.toLowerCase() === 'android';
    },
    setLoadingScreen : function(visible){
      this.view.flxLoading.setVisibility(visible);
      this.view.forceLayout();
    },
    commonEventEmitter(event,args){
      if(event){
        event.apply(this,args);
      }
    }
  };
});