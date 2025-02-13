define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnAddBeneficiary **/
    AS_Button_dff7d086809c48dbbd946e49e701e048: function AS_Button_dff7d086809c48dbbd946e49e701e048(eventobject) {
        var self = this;
        return self.btnAdd_beneficiary.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_c12f758c4311436baf01c9930ee1095f: function AS_Segment_c12f758c4311436baf01c9930ee1095f(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});