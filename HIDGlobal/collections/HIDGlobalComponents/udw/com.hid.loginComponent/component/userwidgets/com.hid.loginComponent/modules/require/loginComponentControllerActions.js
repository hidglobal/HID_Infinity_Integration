define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnCancelOTP **/
    AS_Button_a004d449d34d404d8c576e2ca9e9ea81: function AS_Button_a004d449d34d404d8c576e2ca9e9ea81(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSendOTP **/
    AS_Button_ca19308b6f264516b0eeba38a4e8757b: function AS_Button_ca19308b6f264516b0eeba38a4e8757b(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_da0844daee104fe6b5b961db12479295: function AS_Button_da0844daee104fe6b5b961db12479295(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_df55d32c5e5f461ca61c3e40bf010008: function AS_Button_df55d32c5e5f461ca61c3e40bf010008(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_g1827d99261a4410a495cbfb53701bac: function AS_Button_g1827d99261a4410a495cbfb53701bac(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnLoginFIDO **/
    AS_Button_g9a79443071c45fd89e92ddcbc4af284: function AS_Button_g9a79443071c45fd89e92ddcbc4af284(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_h9207d4829ce4ccfa6e8c47b0d25aee1: function AS_Button_h9207d4829ce4ccfa6e8c47b0d25aee1(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnLoginSecure **/
    AS_Button_i81ba2a337fc44c485833a71b185fef9: function AS_Button_i81ba2a337fc44c485833a71b185fef9(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_ie643632ba6742c9b4d1633955ad66a1: function AS_Button_ie643632ba6742c9b4d1633955ad66a1(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnLogin **/
    AS_Button_j1e34ccb76b64d96b83f132c9b862819: function AS_Button_j1e34ccb76b64d96b83f132c9b862819(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnLoginOOBPIN **/
    AS_Button_j4f8dc1d413c4ed29ba1218ed59a9b7e: function AS_Button_j4f8dc1d413c4ed29ba1218ed59a9b7e(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_eb9915ce89ad4190837ded9f02fe8f35: function AS_Label_eb9915ce89ad4190837ded9f02fe8f35(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_f9aa5ca343914ee7a0ade9de832514f3: function AS_Segment_f9aa5ca343914ee7a0ade9de832514f3(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});