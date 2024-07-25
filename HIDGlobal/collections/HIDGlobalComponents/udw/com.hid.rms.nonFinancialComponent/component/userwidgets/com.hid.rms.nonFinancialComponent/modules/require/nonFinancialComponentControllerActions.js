define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnSubmit **/
    AS_Button_a0b17ac47fae41f18b627ce63ed42b95: function AS_Button_a0b17ac47fae41f18b627ce63ed42b95(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_a9f13e8cdfaa46eeb217d4a3adfd4453: function AS_Button_a9f13e8cdfaa46eeb217d4a3adfd4453(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancel **/
    AS_Button_cf5757dd7eaf49cfb3e1faefbf3cb7b6: function AS_Button_cf5757dd7eaf49cfb3e1faefbf3cb7b6(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_d5c3b4a100c3407691cf8243d5f23430: function AS_Button_d5c3b4a100c3407691cf8243d5f23430(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnSendOTP **/
    AS_Button_e5287adcf3fd422aa504dfc12b5196fb: function AS_Button_e5287adcf3fd422aa504dfc12b5196fb(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnCancelOTP **/
    AS_Button_ffc0676639b4484fa6fc2eed5d42a214: function AS_Button_ffc0676639b4484fa6fc2eed5d42a214(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_g3e1150c3bed4471b4d042aa07433b40: function AS_Button_g3e1150c3bed4471b4d042aa07433b40(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnConfirmOTP **/
    AS_Button_ge9cab963b37461daf300dc9056a22a8: function AS_Button_ge9cab963b37461daf300dc9056a22a8(eventobject) {
        var self = this;
        return self.validateOTP.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_h7cecf9dccba4b9ea2cc27db52e5b197: function AS_Button_h7cecf9dccba4b9ea2cc27db52e5b197(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_ib62dfaaa6234152b7a5ceb41aa803b4: function AS_Button_ib62dfaaa6234152b7a5ceb41aa803b4(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_dc688f81f82c4ebf8286a8bc055e6e06: function AS_Label_dc688f81f82c4ebf8286a8bc055e6e06(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_b2cb9ac6cbb647189abfdd0477957f35: function AS_Segment_b2cb9ac6cbb647189abfdd0477957f35(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});