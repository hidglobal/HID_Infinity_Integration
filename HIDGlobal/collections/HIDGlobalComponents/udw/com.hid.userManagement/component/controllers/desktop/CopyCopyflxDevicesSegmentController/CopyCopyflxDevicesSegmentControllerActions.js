define({
    /*
      This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
    /** onClick defined for btnChangeStatus **/
    AS_Button_dd8a65749cd2417f8fc3faaa5d016692: function AS_Button_dd8a65749cd2417f8fc3faaa5d016692(eventobject, context) {
        var self = this;
        this.executeOnParent("changeDeviceStatusOnClick", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    },
    /** onTouchEnd defined for imgCancel **/
    AS_Image_a40428f6ea9a4740801fc9ec8ea300f8: function AS_Image_a40428f6ea9a4740801fc9ec8ea300f8(eventobject, x, y, context) {
        var self = this;
        var secIndex = context.sectionIndex;
        var rowIndex = context.rowIndex;
        this.executeOnParent("cancelEdit", {
            row: rowIndex,
            section: secIndex
        });
    },
    /** onTouchEnd defined for imgOk **/
    AS_Image_c20d7c7c51db4b5ab456ee9ff5fd4da9: function AS_Image_c20d7c7c51db4b5ab456ee9ff5fd4da9(eventobject, x, y, context) {
        var self = this;
        var secIndex = context.sectionIndex;
        var rowIndex = context.rowIndex;
        this.executeOnParent("editFriendlyName", {
            row: rowIndex,
            section: secIndex
        });
    },
    /** onTouchEnd defined for imgDeleteDevice **/
    AS_Image_cf1177a7048f4ba6a64d43eb1e7c1692: function AS_Image_cf1177a7048f4ba6a64d43eb1e7c1692(eventobject, x, y, context) {
        var self = this;
        this.executeOnParent("deletedeviceButtonClick", {
            row: context.rowIndex,
            section: context.sectionIndex
        });
    },
    /** onTouchEnd defined for Edit **/
    AS_Label_f82ce573a2404e1d955a373fea40977e: function AS_Label_f82ce573a2404e1d955a373fea40977e(eventobject, x, y, context) {
        var self = this;
        var secIndex = context.sectionIndex;
        var rowIndex = context.rowIndex;
        this.executeOnParent("editTouchEnd", {
            row: rowIndex,
            section: secIndex
        });
    }
});