'use strict'

var dataAccess = require('./dataAccess');

/*
	Route for processing the GET request /table/:table_name

	This will query the database twice, once to get the column names and data types and the second to get all the data. 
	It renders the template with a data object that has appended data_type to every data value. This is why the partials directory
	has a list of all postgres data types (most of which aren't yet implemented)
*/
exports.route = function(req, res) {
   
	var describeQuery = 'select column_name, data_type, is_nullable, is_updatable from information_schema.columns where table_schema = \''+process.env.HEROKU_CONNECT_SCHEMA+'\' and table_name=\''+req.params.table_name+'\'';
	
	// set table name on session to be used if we update
	var table_name = req.params.table_name;
	req.session.tableName = req.params.table_name;

	var dataQuery = 'select * from '+process.env.HEROKU_CONNECT_SCHEMA+'.'+table_name;

	// object describe
	dataAccess.query(describeQuery, function(objectDescribe, describeSuccess, describeErr) {
		
		var records = [];
		
		if(describeSuccess) {
			// store the object describe into the session, this will be used to build an update query if required.
			req.session[table_name] = objectDescribe;
			// data query
			dataAccess.query(dataQuery, function(dataRows, success, err) {
			
				if(success) {
					for(var obj in dataRows) {
                        
						var fullObj = dataRows[obj];
						var record = {};
						record.table_name = req.params.table_name;
            			record.fields = [];
                        
						for (var key in fullObj ) {
                           // clean out any data cols that are Heroku Connect specific
							if (fullObj.hasOwnProperty(key)) {
								var field = {};
								if(!key.startsWith('_')) {

                    				field.name = key;
                        			field.value = fullObj[key];
									field.data_type = getDataType(key, objectDescribe);
                        			record.fields.push(field);

									if(key == 'name') {
                        				record.name = fullObj[key];
                        			}
                        			if(key == 'id') {
                        				field.disabled = true;
                        				record.orig_id = fullObj[key];
                        			} else if(field.data_type == 'timestamp without time zone') {
                        				field.disabled = true;
                        			} else {
                        				field.disabled = false;
                        			}
                    			}
                			}
            			} 
            			records.push(record);
        			}	
				} else {
					console.error('There was an error querying the database\n', err);
				}
				records.sort(function(a,b) {
					if(a.name < b.name)
						return -1;
					if(a.name > b.name)
						return 1;
					return 0;
				});
				res.render('table', {records: records, table_name: req.session.tableName, page_heading: 'Heroku Connect Demo'} ); 
			});
		} else {
			console.error('There was an error querying the database\n', err);
			res.render('table', {records: records,table_name: req.session.tableName, page_heading: 'Heroku Connect Demo'} ); 
		}
	});	
};

/*
	handle the update form submit
*/
exports.updateTable = function(req, res) {

	dataAccess.query(getUpdateString(req), function(datarows, success, err) {
		if(!success) {
			console.error('There was an error updating the database\n', err);
		}
		res.redirect("/table/"+req.session.tableName); 
	}); 
}

/*
	Function is designed to build the update string for our database. 
	Probably needs to be updated to handle things that are read only... 
*/
function getUpdateString(req) {

	var tableName = req.session.tableName;
	var objectDescribe = req.session[tableName];

	console.log()
	var query = 'update '+process.env.HEROKU_CONNECT_SCHEMA+'.'+tableName+' SET ';

	Object.keys(req.body).map(function (key) {
		
		// we don't want to update the primary key field or any of the HC connect cols
		if(key != 'orig_id' && !key.startsWith('_') ) {
			query += key + ' = ';
			var value = req.body[key];
			switch(getDataType(key, objectDescribe)) {
				case "smallint":
				case "integer":
				case "bigint":
				case "decimal":
				case "numeric":
				case "real":
				case "double precision":
				case "serial":
				case "bigserial":
					if(!value) {
						query += 'NULL,';
					} else {
						query += req.body[key]+',';
					}
					break;
				default:
					if(!value) {
						query += 'NULL,';
					} else {
						value = value.replace('\'', '\'\''); // postgres escape single quotes
						query += '\''+value+'\',';
					}
					break;
			}
		}	
	});
	query = query.substring(0, query.length - 1);
	query += ' WHERE id = '+ req.body.orig_id;

	return query;
}

/*
	Simple function that looks through the colNames and returns the data type for the data value.
*/
function getDataType(colName, dataTypeArray) {

   for(var dt in dataTypeArray) {
      var theObj = dataTypeArray[dt];
      if(theObj.column_name == colName) { 
         return theObj.data_type;
      }
   }
   return 'not found';
}




