define([],function(){
	var inheritsFrom = function (child, parent){
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
	};
	return inheritsFrom;
});