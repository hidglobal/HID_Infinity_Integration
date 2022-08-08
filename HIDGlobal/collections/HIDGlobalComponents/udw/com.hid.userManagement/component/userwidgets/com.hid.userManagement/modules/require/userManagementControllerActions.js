define({
    /*
          This is an auto generated file and any modifications to it may result in corruption of the action sequence.
        */
    /** onClick defined for btnRegisterDevice **/
    AS_Button_df0c0294252440e4b93f76f19775a863: function AS_Button_df0c0294252440e4b93f76f19775a863(eventobject) {
        var self = this;
        return self.registerApproveOnClick.call(this);
    },
    /** onClick defined for btnDone **/
    AS_Button_fbc7b2d962114cc8bacf9a2c02b47193: function AS_Button_fbc7b2d962114cc8bacf9a2c02b47193(eventobject) {
        var self = this;
        return self.onPollingSuccess.call(this, null);
    },
    /** onClick defined for btnSave **/
    AS_Button_ia957a4a99c240cda42456aa4cb65537: function AS_Button_ia957a4a99c240cda42456aa4cb65537(eventobject) {
        var self = this;
        return self.changePasswordOnClick.call(this);
    },
    /** onClick defined for btnCancel **/
    AS_Button_jd46006c910e42889a8bdca528942c99: function AS_Button_jd46006c910e42889a8bdca528942c99(eventobject) {
        var self = this;
        return self.cancelChangePasswordOnClick.call(this);
    }
});