define({ 
  onEditTouchEnd : function(eventobject){
    var secIndex = eventobject.rowContext.sectionIndex;
    var rowIndex = eventobject.rowContext.rowIndex;
    this.executeOnParent("editTouchEnd", {row : rowIndex, section : secIndex});
  },
  
  onCancelTouchEnd : function(eventobject){
    var secIndex = eventobject.rowContext.sectionIndex;
    var rowIndex = eventobject.rowContext.rowIndex;
    this.executeOnParent("cancelEdit", {row : rowIndex, section : secIndex});
  },
  
  onEditOkTouchEnd : function(eventobject){
    var secIndex = eventobject.rowContext.sectionIndex;
    var rowIndex = eventobject.rowContext.rowIndex;
    this.executeOnParent("editFriendlyName", {row : rowIndex, section : secIndex});
  }

 });