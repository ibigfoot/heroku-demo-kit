'use strict'

var express = require('express');
var exphbs  = require('express-handlebars');

var helpers = require('./lib/helpers');

var home = require('./lib/home');
var tables = require('./lib/tables');
var table = require('./lib/table');

var app = express();
var bodyParser = require('body-parser');

var redis = require("redis");
var redisClient = redis.createClient({url: process.env.REDIS_URL});

var session = require('express-session');
var RedisStore = require('connect-redis')(session);


app.use(session({  
  store: new RedisStore({client: redisClient}),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false
}));



app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// body parser for form parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers      : helpers
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', home.route);
app.get('/tables', tables.route);
app.get('/table/:table_name', table.route);
app.post('/data', table.updateTable);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

