define({
    /*
          This is an auto generated file and any modifications to it may result in corruption of the action sequence.
        */
    /** onClick defined for btnSendOTP **/
    AS_Button_a91ece4869d84ece8f62fcb0298724ae: function AS_Button_a91ece4869d84ece8f62fcb0298724ae(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_ae231eb54f18408da74695f4b6f264e7: function AS_Button_ae231eb54f18408da74695f4b6f264e7(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_af325467f3824b3b80bc9d71881ef644: function AS_Button_af325467f3824b3b80bc9d71881ef644(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancelOTP **/
    AS_Button_afe64f5cae044e82811a461edaab4c5a: function AS_Button_afe64f5cae044e82811a461edaab4c5a(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSubmit **/
    AS_Button_c62bc68547324b719b49c9e5dadad6da: function AS_Button_c62bc68547324b719b49c9e5dadad6da(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancel **/
    AS_Button_cc85ec45fddf4e139b5d77822fa74c56: function AS_Button_cc85ec45fddf4e139b5d77822fa74c56(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_d0ff93364fd2441f8c7ddc847f090c66: function AS_Button_d0ff93364fd2441f8c7ddc847f090c66(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_d207d860fff4456693e16f02642c1633: function AS_Button_d207d860fff4456693e16f02642c1633(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnConfirmOTP **/
    AS_Button_e31eee39291f4898a07ef38b3e858de0: function AS_Button_e31eee39291f4898a07ef38b3e858de0(eventobject) {
        var self = this;
        return self.validateOTP.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_f7f34412437e40558dbb2e3482af2dfa: function AS_Button_f7f34412437e40558dbb2e3482af2dfa(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_becc74f5c00547259e65a033629a5d48: function AS_Label_becc74f5c00547259e65a033629a5d48(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_b9b5531430854e448f977e756e2e4eff: function AS_Segment_b9b5531430854e448f977e756e2e4eff(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.cancelOnClick.call(this);
    }
});