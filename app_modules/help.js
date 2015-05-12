var mongoose = require('mongoose'),
    models = require('./../models'),
    User = models.userModel,
    Event = models.eventModel;


exports.initialize = function(bot) {
    logEvents(bot);
}

function logEvents(bot) {
    bot.on("new user", function(user){
        console.log("hey you",user);
        var answer="Welcome "+user.nick+" on WormNet! If you have any problem please read this tutorial:  http://www.tus-wa.com/forums/dos-help/newbie-guide-book-26874/";
        bot.pm(user.nick,answer);
    });
    
  
}