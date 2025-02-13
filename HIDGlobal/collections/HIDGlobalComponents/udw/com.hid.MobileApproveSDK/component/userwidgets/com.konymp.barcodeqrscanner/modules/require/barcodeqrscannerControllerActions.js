define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for flxFlash **/
    AS_FlexContainer_e0056da30a0c47ff9e9155b70cd6c23c: function AS_FlexContainer_e0056da30a0c47ff9e9155b70cd6c23c(eventobject) {
        var self = this;
        this.flashControl();
    },
    /** onClick defined for flxCamera **/
    AS_FlexContainer_f1cbe0028d4e4f899262997c157d17ba: function AS_FlexContainer_f1cbe0028d4e4f899262997c157d17ba(eventobject) {
        var self = this;
        this.toggleCamera();
    },
    /** onClick defined for flxClose **/
    AS_FlexContainer_j61144a076c2446eb222f15d68a1ea85: function AS_FlexContainer_j61144a076c2446eb222f15d68a1ea85(eventobject) {
        var self = this;
        this.stopScan();
        this.onClickClose();
    },
    /** onCreated defined for ncScan **/
    AS_NativeContainer_b018640527834c38b787332f466b4592: function AS_NativeContainer_b018640527834c38b787332f466b4592(eventobject) {
        var self = this;
        this.scan(eventobject);
    },
    /** onCleanup defined for ncScan **/
    AS_NativeContainer_fdf989852fb24299a4774dc99c748e7e: function AS_NativeContainer_fdf989852fb24299a4774dc99c748e7e(eventobject) {
        var self = this;
        this.release(eventobject);
    }
});