define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnCancelSendOTP **/
    AS_Button_a691c0ad29c94f71ae377ec9eaebbdcc: function AS_Button_a691c0ad29c94f71ae377ec9eaebbdcc(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnTryOTP **/
    AS_Button_be7d1b2fcb864ebb90c6e258db6e8478: function AS_Button_be7d1b2fcb864ebb90c6e258db6e8478(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnLoginOOBPIN **/
    AS_Button_e965f2f4de0e4456b573e7ede582623e: function AS_Button_e965f2f4de0e4456b573e7ede582623e(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnLoginFIDO **/
    AS_Button_f09aba1e7f774f8898dfe1fdd0369a57: function AS_Button_f09aba1e7f774f8898dfe1fdd0369a57(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelOTP **/
    AS_Button_f24fee44a771436587ebe0c49b78e867: function AS_Button_f24fee44a771436587ebe0c49b78e867(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnLoginSecure **/
    AS_Button_fc7a1f582284443b8b03c2a5ec0d0ad0: function AS_Button_fc7a1f582284443b8b03c2a5ec0d0ad0(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnSendOTP **/
    AS_Button_fd4c1132c85a4b2694499c61d8fa346d: function AS_Button_fd4c1132c85a4b2694499c61d8fa346d(eventobject) {
        var self = this;
        return self.initiateSecondFactor.call(this);
    },
    /** onClick defined for btnCancelApprove **/
    AS_Button_g613a200f57447eebfb8e32809d78033: function AS_Button_g613a200f57447eebfb8e32809d78033(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onClick defined for btnSecureCode **/
    AS_Button_gd89b500dafb46bcb8e4f11d01d8b1f9: function AS_Button_gd89b500dafb46bcb8e4f11d01d8b1f9(eventobject) {
        var self = this;
        return self.trySecureCodeOnClick.call(this);
    },
    /** onClick defined for btnLogin **/
    AS_Button_h38ea8aa08704f1db094ac82c174181b: function AS_Button_h38ea8aa08704f1db094ac82c174181b(eventobject) {
        var self = this;
        return self.loginPassword.call(this);
    },
    /** onClick defined for btnCancelPush **/
    AS_Button_ieb0c4297e67480393b1f6128beb4a9c: function AS_Button_ieb0c4297e67480393b1f6128beb4a9c(eventobject) {
        var self = this;
        return self.cancelOnClick.call(this);
    },
    /** onTouchEnd defined for lblResendNot **/
    AS_Label_e0f65b60282044c1a72f2f79dbdc293a: function AS_Label_e0f65b60282044c1a72f2f79dbdc293a(eventobject, x, y) {
        var self = this;
        return self.resendPushTouchEnd.call(this);
    },
    /** onRowClick defined for segmentPushDevices **/
    AS_Segment_e2b37beb9d254b6ebcbb3721dc62f336: function AS_Segment_e2b37beb9d254b6ebcbb3721dc62f336(eventobject, sectionNumber, rowNumber) {
        var self = this;
        return self.initiateApprove.call(this, rowNumber);
    }
});