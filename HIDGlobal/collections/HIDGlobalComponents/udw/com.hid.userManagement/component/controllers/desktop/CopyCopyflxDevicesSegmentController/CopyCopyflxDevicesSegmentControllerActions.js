define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnChangeStatus **/
    AS_Button_je76f50671f54717b4718ab235d9b9d0: function AS_Button_je76f50671f54717b4718ab235d9b9d0(eventobject, context) {
        var self = this;
        this.executeOnParent("changeDeviceStatusOnClick", {
            row: eventobject.rowContext.rowIndex,
            section: eventobject.rowContext.sectionIndex
        });
    },
    /** onTouchEnd defined for imgOk **/
    AS_Image_aead8761a31d4081938186bb2f0001db: function AS_Image_aead8761a31d4081938186bb2f0001db(eventobject, x, y, context) {
        var self = this;
        return self.onEditOkTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for imgCancel **/
    AS_Image_e15fabd8e40c4c2f961f8d5710706dc0: function AS_Image_e15fabd8e40c4c2f961f8d5710706dc0(eventobject, x, y, context) {
        var self = this;
        return self.onCancelTouchEnd.call(this, eventobject);
    },
    /** onTouchEnd defined for imgDeleteDevice **/
    AS_Image_j6744e4134e74beab5fcc9a1dce944b2: function AS_Image_j6744e4134e74beab5fcc9a1dce944b2(eventobject, x, y, context) {
        var self = this;
        this.executeOnParent("deletedeviceButtonClick", {
            row: eventobject.rowContext.rowIndex,
            section: eventobject.rowContext.sectionIndex
        });
    },
    /** onTouchEnd defined for Edit **/
    AS_Label_b0332201388845e0819430c5b8b83c22: function AS_Label_b0332201388845e0819430c5b8b83c22(eventobject, x, y, context) {
        var self = this;
        return self.onEditTouchEnd.call(this, eventobject);
    }
});