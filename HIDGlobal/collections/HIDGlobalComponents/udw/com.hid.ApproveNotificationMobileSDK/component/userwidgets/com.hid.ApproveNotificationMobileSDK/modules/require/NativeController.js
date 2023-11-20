define([],function () {
  var NativeController=function(componentInstance){
    this.componentInstance=componentInstance;
  };
  NativeController.prototype.getPasswordPolicy = function(){
    throw new Error('getPasswordPolicy function is not implemented');
  };
  return NativeController;
});