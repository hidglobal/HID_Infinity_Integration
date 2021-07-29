define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnLogin **/
    AS_Button_i0e4d4109cdf4398b2795a9cd4f8f279: function AS_Button_i0e4d4109cdf4398b2795a9cd4f8f279(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnConfirmOTP **/
    AS_Button_c3f0065bccf94e0c91298e9f6485b3b0: function AS_Button_c3f0065bccf94e0c91298e9f6485b3b0(eventobject) {
        var self = this;
        return self.validateOTP.call(this);
    },
    /** onClick defined for btnCancelOTP **/
    AS_Button_ffe0ec05544948ef91a32ecc076d045c: function AS_Button_ffe0ec05544948ef91a32ecc076d045c(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSendOTP **/
    AS_Button_c055f0ea0eaa4c9ea917ed52a1c93130: function AS_Button_c055f0ea0eaa4c9ea917ed52a1c93130(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_h9e3e1daad9c491b8fa9ef0359929a4d: function AS_Button_h9e3e1daad9c491b8fa9ef0359929a4d(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_b665927de68c4985b4b97a4f0a939bfc: function AS_Segment_b665927de68c4985b4b97a4f0a939bfc(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_b0ebddf304d6460b905404d6b496e0df: function AS_Button_b0ebddf304d6460b905404d6b496e0df(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_i594f2e364034e6591171be6255642d7: function AS_Button_i594f2e364034e6591171be6255642d7(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_fb87b28254404c7d89891f35a2ef3df7: function AS_Label_fb87b28254404c7d89891f35a2ef3df7(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_f5c1e87f46f341d1807d9a5f75939001: function AS_Button_f5c1e87f46f341d1807d9a5f75939001(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_f81a7a839abc4b228e68d33a1cd170b7: function AS_Button_f81a7a839abc4b228e68d33a1cd170b7(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    }
});