define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnRegisterDevice **/
    AS_Button_bcb361b193ea4bfa9925a0e865b11335: function AS_Button_bcb361b193ea4bfa9925a0e865b11335(eventobject) {
        var self = this;
        return self.registerApproveOnClick.call(this);
    },
    /** onClick defined for btnDone **/
    AS_Button_d2b6989d87284c8aa55585b07854c377: function AS_Button_d2b6989d87284c8aa55585b07854c377(eventobject) {
        var self = this;
        return self.onPollingSuccess.call(this, null);
    },
    /** onClick defined for btnSave **/
    AS_Button_e8a9930e43334741b7ce3d5654fcc64f: function AS_Button_e8a9930e43334741b7ce3d5654fcc64f(eventobject) {
        var self = this;
        return self.changePasswordOnClick.call(this);
    },
    /** onClick defined for btnRegisterFIDODevice **/
    AS_Button_f1b1aa0d8d7d4a979aab76c0549eb57a: function AS_Button_f1b1aa0d8d7d4a979aab76c0549eb57a(eventobject) {
        var self = this;
        return self.registerFIDOOnClick.call(this);
    },
    /** onClick defined for btnCancel **/
    AS_Button_h237bd499f394ce9b0834d37dc57b20c: function AS_Button_h237bd499f394ce9b0834d37dc57b20c(eventobject) {
        var self = this;
        return self.cancelChangePasswordOnClick.call(this);
    }
});