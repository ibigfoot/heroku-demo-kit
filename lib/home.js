'use strict'

/*
	Route for processing the GET request to root context
*/
exports.route = function(req,res) {
	res.render('home', {auth:false, page_heading: 'Heroku Demo Kit'});
};