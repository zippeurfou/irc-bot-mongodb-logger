var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nconf = require('nconf');
var Bot = require("./app_modules/bot");
var botlogger = require("./app_modules/logger");
var history = require("./app_modules/history");
var help = require("./app_modules/help");
nconf.argv()
    .env()
    .file({
        file: 'config.json'
    });
nconf.use("memory");
//Retrieve it
var conf = {
    database: {
        hostname: nconf.get("database:hostname"),
        db_name: nconf.get("database:db_name")
    },
    irc_bot: {
        hostname: nconf.get("irc_bot:hostname"),
        username: nconf.get("irc_bot:username"),
        password: nconf.get("irc_bot:password"),
        channels: nconf.get("irc_bot:channels")
    }
};


mongoose.connect('mongodb://' + conf.database.hostname + '/' + conf.database.db_name);
//Create the bot module
new Bot(conf.irc_bot.username, conf.irc_bot.hostname, conf.irc_bot.password, conf.irc_bot.channels, function(bot) {
    //Some issue with the callback should look into it.
  
        console.log("starting logger");
        //initialize the mongodb log
        botlogger.initialize(bot);
        history.initialize(bot);
        help.initialize(bot);
        //Insert your own module here
  



});





//TODO
var routes = require('./routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//TODO
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;