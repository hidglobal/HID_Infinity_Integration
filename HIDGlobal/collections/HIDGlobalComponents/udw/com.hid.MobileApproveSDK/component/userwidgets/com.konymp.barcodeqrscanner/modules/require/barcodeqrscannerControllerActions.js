define({
    /*
          This is an auto generated file and any modifications to it may result in corruption of the action sequence.
        */
    /** onClick defined for flxCamera **/
    AS_FlexContainer_c0b4981f42204767b8c06781f1d6e016: function AS_FlexContainer_c0b4981f42204767b8c06781f1d6e016(eventobject) {
        var self = this;
        this.toggleCamera();
    },
    /** onClick defined for flxClose **/
    AS_FlexContainer_f186359e1a1e4774a434bd5e475c21bf: function AS_FlexContainer_f186359e1a1e4774a434bd5e475c21bf(eventobject) {
        var self = this;
        this.stopScan();
        this.onClickClose();
    },
    /** onClick defined for flxFlash **/
    AS_FlexContainer_j654c960f92a4e1ba498d832bde17d7f: function AS_FlexContainer_j654c960f92a4e1ba498d832bde17d7f(eventobject) {
        var self = this;
        this.flashControl();
    },
    /** onCreated defined for ncScan **/
    AS_NativeContainer_d9228af85144405da7da7c3201ed7354: function AS_NativeContainer_d9228af85144405da7da7c3201ed7354(eventobject) {
        var self = this;
        this.scan(eventobject);
    },
    /** onCleanup defined for ncScan **/
    AS_NativeContainer_ib1d2a18722c4a269eb3cc8152749836: function AS_NativeContainer_ib1d2a18722c4a269eb3cc8152749836(eventobject) {
        var self = this;
        this.release(eventobject);
    }
});