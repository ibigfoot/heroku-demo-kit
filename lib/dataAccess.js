'use strict'

// dataAccess contains methods for calling the DB. 

var Pool = require('pg').Pool;
var dbPool = new Pool(getDatabaseConfig());

dbPool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
});

/*
	Execute a database query

	callback(obj[] resultRows, boolean success, error)
*/
exports.query = function(queryString, callback) {

	console.log("QUERY \n"+queryString);
   dbPool.connect(function(err, client, done){
      if(err) {
         callback([],false, err);
      } else {
         client.query(queryString, 
         function(err, result) {
            done();
            if (err) { 
              	callback([], false, err);
            } else {
            	callback(result.rows, true);
            }
         });
      }
   });
}

/*
	Execute an update query (is it needed?)
*/
exports.update = function(updateString, callback) {

	console.log("UPDATE QUERY \n"+updateString);
	dbPool.connect(function(err, client, done) {
		if(err) {
			callback(false, err);
		} else {
			client.query(updateString, function(err, result){
				done();
				if(err) {
					callback(false, err);
				} else {
					callback(true);
				}
			});
		}
	});
}

function getDatabaseConfig() {

   var dbUrl = process.env.DATABASE_URL;
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