define([],function () {
  	var NativeController=function(componentInstance){
      	this.componentInstance=componentInstance;
    };
   /**
     * @function scan
     * @private
     * @description: scan the code
     */
    NativeController.prototype.scan=function(eventobject,cameraFacing){
     throw new Error('You have to implement the method scan!');
  };
   /**
     * @function resumeScan
     * @private
     * @description: API to resume the scan after 1 successful scan
     */
  NativeController.prototype.resumeScan=function(){
     throw new Error('You have to implement the method resumeScan!');
  };
  /**
     * @function flashControl
     * @private
     * @description: API to let user control the flash of the camera
     */
  NativeController.prototype.flashControl=function(){
     throw new Error('You have to implement the method flashControl!');
  };
   /**
     * @function release
     * @private
     * @description: release the view of native container
     */
    NativeController.prototype.release=function(eventobject){
     throw new Error('You have to implement the method release!');
  };
  return NativeController;
});