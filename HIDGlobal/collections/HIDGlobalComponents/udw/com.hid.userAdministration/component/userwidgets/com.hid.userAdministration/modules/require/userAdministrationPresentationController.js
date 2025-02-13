define([`com/hid/userAdministration/userAdministrationBusinessController`], function(userAdministrationBusinessController)  {
  var instance = null;
  userAdministrationPresentationController.prototype.validatePassword = function(username, password, S_CB, F_CB){
    userAdministrationBusinessController.validatePassword(username, password, S_CB, F_CB);
  };
  userAdministrationPresentationController.prototype.resetFailureCount = function(userid,authType, S_CB, F_CB,correlationId){
    let params = {"userid" : userid, "authType" : authType , "correlationId" : correlationId };
    userAdministrationBusinessController.resetFailureCount(params, S_CB, F_CB);
  };
  userAdministrationPresentationController.prototype.viewAuthenticators = function(username, S_CB, F_CB){
    let params = {"filter" : username };
    userAdministrationBusinessController.viewAuthenticators(params, S_CB, F_CB);
  };
  userAdministrationPresentationController.prototype.enableDisableAuthenticator = function(active,authType,sts,userid,S_CB, F_CB,correlationId){
    let params = {"active" : active, "authType": authType, "status": sts, "userId": userid , "correlationId" : correlationId};
    userAdministrationBusinessController.enableDisableAuthenticator(params,S_CB, F_CB);
  };
  function userAdministrationPresentationController(){
  }
  userAdministrationPresentationController.getInstance = function(){
    instance = instance === null ? new userAdministrationPresentationController() : instance;
    return instance;
  };
  return userAdministrationPresentationController.getInstance();
});