'use strict'

var express = require('express');
var exphbs  = require('express-handlebars');
var helpers = require('./lib/helpers');

var Pool = require('pg').Pool;
var app = express();

var bodyParser = require('body-parser');


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers      : helpers
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', function(request, response) {

  response.render('home', {auth:false, page_heading: 'Heroku Demo Kit'});
});


var pool = new Pool(getDatabaseConfig());

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
});

// TODO - refactor database access as per documentation
// from express documentation http://expressjs.com/en/guide/database-integration.html#postgres
// var pgpromise = require('pg-promise');
// var db = pgpromise(process.env.HEROKU_CONNECT_SCHEMA);

app.get('/tables', function (request, response) {

   pool.connect(function(err, client, done){
      if(err) {
         console.log(err);
         response.send("Error " + err); 
      } else {
         client.query('select * from information_schema.tables where table_schema = \''+process.env.HEROKU_CONNECT_SCHEMA+'\'', 
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
               response.render('tables', {tables: tables, schema: process.env.HEROKU_CONNECT_SCHEMA, page_heading: 'Heroku Connect Demo'} ); 
            }
         });
      }
   });
});


app.get('/table/:table_name', function(request, response) {

   var objectDescribe = [];
   pool.connect(function(connectErr,client, done) {
      if(connectErr) {
         console.log(JSON.stringify(connectErr));
         response.send(connectErr);
      } else {
         var queryString = 'select column_name, data_type from information_schema.columns where table_schema = \''+process.env.HEROKU_CONNECT_SCHEMA+'\' and table_name=\''+request.params.table_name+'\'';
         client.query(queryString, function(err,result) { 
            if(err) {
               console.log(JSON.stringify(err));
               response.send(err);
            } else {
               
               objectDescribe = result.rows;
               queryString = 'select * from '+process.env.HEROKU_CONNECT_SCHEMA+'.'+request.params.table_name;
               
               client.query(queryString, function(queryErr, queryResult) {
                  done();
                  if(queryErr){
                     console.log(JSON.stringify(queryErr));
                     response.send(queryErr);
                  } else {
                    
                     var records = [];
                     for(var obj in queryResult.rows) {
                        
                        var fullObj = queryResult.rows[obj];
                        var record = {};
                        record.table_name = request.params.table_name;
                        record.fields = [];
                        
                        for (var key in fullObj ) {
                           
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
                              }
                           }
                        } 
                        records.push(record);
                     }
                     response.render('table', {records: records, table_name: request.params.table_name, page_heading: 'Heroku Connect Demo'} ); 
                  }

               });
            }
         });
      }
   });
});

app.post('/data', function(request, response) {
  console.log("we have a form submit");
  console.log(getUpdateString(request.body));
  response.redirect("/table/"+request.body.table_name);  
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function getUpdateString(reqBody) {

  var query = 'update '+reqBody.table_name+' (';
  var keys = '';
  var values = '';
  Object.keys(reqBody).map(function (key) {
    if(key != 'table_name') {
      keys += '\''+key+'\',';
      values += '\''+reqBody[key]+'\',';
    }
  });
  keys = keys.substring(0, keys.length-1);
  values = values.substring(0, values.length-1);
  query += keys +')';
  query += ' values ('+values+')';

  return query;

}

function getDatabaseConfig() {

   var dbUrl = process.env.DATABASE_URL;
   //postgres://tsellers:Demo1234@localhost:5432/node-hc-demo
   var parts = dbUrl.split(":");
   var hostAndPwd = parts[2].split("@");
   var portAndDb = parts[3].split("/");

   var config = {
      host: hostAndPwd[1],
      user: parts[1].substring(2,parts[1].length),
      password: hostAndPwd[0],
      database: portAndDb[1],
      port: portAndDb[0],
      max: 10,
      idleTimeoutMillis: 30000
   };
   return config;
}

function getDataType(colName, dataTypeArray) {

   for(var dt in dataTypeArray) {
      var theObj = dataTypeArray[dt];
      if(theObj.column_name == colName) { 
         return theObj.data_type;
      }
   }
   return 'not found';
}

