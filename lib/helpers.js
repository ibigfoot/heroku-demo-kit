'use strict'

exports.mapLoop = function(theMap, block) {
	var out = '';
	Object.keys( theMap ).map(function( prop ) {
		if(!prop.startsWith("_")) {
			if(prop != null && prop != undefined) { 
				out += block.fn( {key: prop, value: theMap[ prop ]} );
			} else {
				out += block.fn( {key: prop, value: ''});
			}
		}
	});
	return out;	
};

exports.isEqual = function (theString, theValue) {
	
	if(theString == theValue) 
		return true;

	return false;

}