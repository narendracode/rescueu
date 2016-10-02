var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config/config');
var mongoose = require("mongoose");
var passport = require('passport');

var fs = require('fs');

var app = express();

var jwt = require('express-jwt');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect to mongodb
var connect = function(){
    var options = {
        server: {
            socketOptions:{
                keepAlive : 1
            }
        }
    };
    console.log('info', 'connected to mongo db with config url : '+config.db);
    mongoose.connect(config.db,options);
};
connect();
mongoose.connection.on('error',console.log);
mongoose.connection.on('disconnected',connect);
require('./app/authorization/passport')(passport); //settting up passport config

var cert = fs.readFileSync('key.pem');

app.use(jwt({ secret: cert}).unless({path: ['/auth/signup',
                                            ,'/auth/login'
                                            ,'/auth/userinfo'
                                            ,'/auth/logout'
                                            ,'/'
                                           ]})); // API end point in path are public 

app.use(function(err, req, res, next){
    console.log(" ##### Err "+err);
       if (err.constructor.name === 'UnauthorizedError') {
                  res.status(401).send('Unauthorized');
                      }
});

require('./config/routes')(app);
require('./config/express')(app);

module.exports = app;
