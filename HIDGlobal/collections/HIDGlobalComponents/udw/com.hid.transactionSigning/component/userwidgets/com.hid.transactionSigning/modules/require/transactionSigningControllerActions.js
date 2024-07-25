define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnAddBeneficiary **/
    AS_Button_a9e2a8a76fdc4a68bb453fc2154d068e: function AS_Button_a9e2a8a76fdc4a68bb453fc2154d068e(eventobject) {
        var self = this;
        return self.btnAdd_beneficiary.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_e1c42d1e98114e4dafb66f69a6104dec: function AS_Segment_e1c42d1e98114e4dafb66f69a6104dec(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});