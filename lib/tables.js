'use strict'

var dataAccess = require('./dataAccess');

/*
	Route for processing the GET request /tables

	This will query the HC Schema and look for tables in the postgres information_schema. It should 
	handle any table that has been synchronised dynamically.
*/
exports.route = function (req, res) {

	var queryString = 'select * from information_schema.tables where table_schema = \''+process.env.HEROKU_CONNECT_SCHEMA+'\'';

	dataAccess.query(queryString, function(resultRows, success, err) {
		var tables = [];
		if(success) {
			// clean out the Heroku Connect tables from the Schema.. these are prefixed with an underscore               
			resultRows.forEach( function (item) {
				if(!item.table_name.startsWith("_")) {
            		tables.push(item);
            	}
			});
		} else {
			console.log(err);
		}
		res.render('tables', {tables: tables, schema: process.env.HEROKU_CONNECT_SCHEMA, page_heading: 'Heroku Connect Demo'} ); 
	});

};