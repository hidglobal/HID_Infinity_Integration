define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnReset **/
    AS_Button_ba42a9461a224bdda4ceaed8602cd921: function AS_Button_ba42a9461a224bdda4ceaed8602cd921(eventobject, context) {
        var self = this;
        this.executeOnParent("resetFailureCount", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    },
    /** onClick defined for btnEnbaleDisable **/
    AS_Button_jeb79b9dcd7b4f3f9dc16f25f15be991: function AS_Button_jeb79b9dcd7b4f3f9dc16f25f15be991(eventobject, context) {
        var self = this;
        this.executeOnParent("enableDisableAuthenticator", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    }
});