define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnReset **/
    AS_Button_a10950f2f02648968da7a915c6c56e86: function AS_Button_a10950f2f02648968da7a915c6c56e86(eventobject, context) {
        var self = this;
        this.executeOnParent("resetFailureCount", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    },
    /** onClick defined for btnEnbaleDisable **/
    AS_Button_fd714249923446af893aa4bb5126e92c: function AS_Button_fd714249923446af893aa4bb5126e92c(eventobject, context) {
        var self = this;
        this.executeOnParent("enableDisableAuthenticator", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    }
});