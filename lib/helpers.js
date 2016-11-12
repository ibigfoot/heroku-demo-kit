'use strict'

// Moustache Template helpers

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
