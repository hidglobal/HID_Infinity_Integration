define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnLoginSecure **/
    AS_Button_c0571ca786f14b69abf3527f4774f6f0: function AS_Button_c0571ca786f14b69abf3527f4774f6f0(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_cc09780fe17b40f8a9af0166b3cfd996: function AS_Button_cc09780fe17b40f8a9af0166b3cfd996(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_d21daa4ce3894f5c887f0f7692602d7f: function AS_Button_d21daa4ce3894f5c887f0f7692602d7f(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnLoginFIDO **/
    AS_Button_da8c211a1c9847e683cb13a85540b5eb: function AS_Button_da8c211a1c9847e683cb13a85540b5eb(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_ddfb51a0bf4a4d4db7c0b0a77113abf1: function AS_Button_ddfb51a0bf4a4d4db7c0b0a77113abf1(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnLoginOOBPIN **/
    AS_Button_e5fc942f88524610bda9a770ae4aa4ca: function AS_Button_e5fc942f88524610bda9a770ae4aa4ca(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_f912a45ccab34a798f11781c9c080106: function AS_Button_f912a45ccab34a798f11781c9c080106(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnLogin **/
    AS_Button_f93a709663ee4106a9cc6bb2d4f02f56: function AS_Button_f93a709663ee4106a9cc6bb2d4f02f56(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelOTP **/
    AS_Button_g714298b76774421ba52d1286c6163c4: function AS_Button_g714298b76774421ba52d1286c6163c4(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSendOTP **/
    AS_Button_h52af7ad910f4f828a64ff7f95bfbe37: function AS_Button_h52af7ad910f4f828a64ff7f95bfbe37(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_j0e9071821004aeb86e05cde100780ae: function AS_Button_j0e9071821004aeb86e05cde100780ae(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_fac522fd4fff4a97bef584645cb796c5: function AS_Label_fac522fd4fff4a97bef584645cb796c5(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_d24a638397e847c1938fee698d4a7ef1: function AS_Segment_d24a638397e847c1938fee698d4a7ef1(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});