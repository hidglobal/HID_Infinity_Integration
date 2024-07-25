define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for flxCamera **/
    AS_FlexContainer_df1e6256b2dd4c9ba95608f97da0567d: function AS_FlexContainer_df1e6256b2dd4c9ba95608f97da0567d(eventobject) {
        var self = this;
        this.toggleCamera();
    },
    /** onClick defined for flxFlash **/
    AS_FlexContainer_e5592a9e311647208b8e429e6bcb19de: function AS_FlexContainer_e5592a9e311647208b8e429e6bcb19de(eventobject) {
        var self = this;
        this.flashControl();
    },
    /** onClick defined for flxClose **/
    AS_FlexContainer_g3fff0baf4024ca5ab07355bd4a6ecb0: function AS_FlexContainer_g3fff0baf4024ca5ab07355bd4a6ecb0(eventobject) {
        var self = this;
        this.stopScan();
        this.onClickClose();
    },
    /** onCleanup defined for ncScan **/
    AS_NativeContainer_f3071f9b54c44300a73c31c8407e7f3f: function AS_NativeContainer_f3071f9b54c44300a73c31c8407e7f3f(eventobject) {
        var self = this;
        this.release(eventobject);
    },
    /** onCreated defined for ncScan **/
    AS_NativeContainer_i0aa6e12dd444a568ecde45bdc979f1d: function AS_NativeContainer_i0aa6e12dd444a568ecde45bdc979f1d(eventobject) {
        var self = this;
        this.scan(eventobject);
    }
});