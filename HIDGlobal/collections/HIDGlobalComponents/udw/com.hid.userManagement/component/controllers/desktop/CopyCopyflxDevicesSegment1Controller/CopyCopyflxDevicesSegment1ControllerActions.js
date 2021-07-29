define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onTouchEnd defined for Edit **/
    AS_Label_adaa46f740da40e0931081e5dc676288: function AS_Label_adaa46f740da40e0931081e5dc676288(eventobject, x, y, context) {
        var self = this;
        return self.onEditTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for imgOk **/
    AS_Image_ea57b9ae78db47c7bb7b05d6a4c6d48e: function AS_Image_ea57b9ae78db47c7bb7b05d6a4c6d48e(eventobject, x, y, context) {
        var self = this;
        return self.onEditOkTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for imgCancel **/
    AS_Image_ed8cb251cee947e188d4419fb0472416: function AS_Image_ed8cb251cee947e188d4419fb0472416(eventobject, x, y, context) {
        var self = this;
        return self.onCancelTouchEnd.call(this, eventobject);
    },
    /** onClick defined for btnChangeStatus **/
    AS_Button_gd8465f5ac7043e4b7be9bdc7d3e0b27: function AS_Button_gd8465f5ac7043e4b7be9bdc7d3e0b27(eventobject, context) {
        var self = this;
        this.executeOnParent("changeDeviceStatusOnClick", {
            row: eventobject.rowContext.rowIndex,
            section: eventobject.rowContext.sectionIndex
        });
    }
});