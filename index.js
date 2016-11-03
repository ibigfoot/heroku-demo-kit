'use strict'

var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
//app.engine('handlebars', exphbs({extname: '.html'}));
app.set('view engine', 'handlebars');

// views is directory for all template files
//app.set('views', __dirname + '/views');


app.get('/', function(request, response) {
  response.render('home', {auth:false});
});



var pg = require('pg');

app.get('/tables', function (request, response) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		var schema = process.env.HEROKU_CONNECT_SCHEMA
		client.query('select table_name from information_schema.tables where table_schema = \''+schema+'\'', 
      function(err, result) {
        done();
      	if (err) { 
            console.error(err); 
            response.send("Error " + err); 
      	} else {
            var tables = [];
            result.rows.forEach( function (item) {
               if(!item.table_name.startsWith("_")) {
                  tables.push(item);
               }
            });
       		response.render('tables', {tables: tables} ); 
       	}
    	});
  	});
});

app.get('/table/:table_name', function(request, response) {
   console.log("Request Params ["+JSON.stringify(request.params)+"]");
   response.render('table', {table_name: request.params.table_name});
})


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


