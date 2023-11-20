define({
    /*
          This is an auto generated file and any modifications to it may result in corruption of the action sequence.
        */
    /** onClick defined for btnChangeStatus **/
    AS_Button_i5fac94ce36c43d0a1cb2eb61c082868: function AS_Button_i5fac94ce36c43d0a1cb2eb61c082868(eventobject, context) {
        var self = this;
        this.executeOnParent("changeDeviceStatusOnClick", {
            row: eventobject.rowContext.rowIndex,
            section: eventobject.rowContext.sectionIndex
        });
    },
    /** onTouchEnd defined for imgCancel **/
    AS_Image_e966002e90dd440b8100bfc883c33772: function AS_Image_e966002e90dd440b8100bfc883c33772(eventobject, x, y, context) {
        var self = this;
        return self.onCancelTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for imgDeleteDevice **/
    AS_Image_e979798e4d894a9fb2112832735038ab: function AS_Image_e979798e4d894a9fb2112832735038ab(eventobject, x, y, context) {
        var self = this;
        this.executeOnParent("deletedeviceButtonClick", {
            row: eventobject.rowContext.rowIndex,
            section: eventobject.rowContext.sectionIndex
        });
    },
    /** onTouchEnd defined for imgOk **/
    AS_Image_h952bc2fb39d452f8049640042717a48: function AS_Image_h952bc2fb39d452f8049640042717a48(eventobject, x, y, context) {
        var self = this;
        return self.onEditOkTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for Edit **/
    AS_Label_bc170c8819e3446c88a40e8c4a16c8de: function AS_Label_bc170c8819e3446c88a40e8c4a16c8de(eventobject, x, y, context) {
        var self = this;
        return self.onEditTouchEnd.call(this, eventobject);
    }
});