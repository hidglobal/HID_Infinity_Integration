define({
    /*
          This is an auto generated file and any modifications to it may result in corruption of the action sequence.
        */
    /** onClick defined for btnReset **/
    AS_Button_c617f47e37544409b8f562fede7a5cb2: function AS_Button_c617f47e37544409b8f562fede7a5cb2(eventobject, context) {
        var self = this;
        this.executeOnParent("resetFailureCount", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    },
    /** onClick defined for btnEnbaleDisable **/
    AS_Button_fe3866847f5245c291528e5ea5180991: function AS_Button_fe3866847f5245c291528e5ea5180991(eventobject, context) {
        var self = this;
        this.executeOnParent("enableDisableAuthenticator", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    }
});