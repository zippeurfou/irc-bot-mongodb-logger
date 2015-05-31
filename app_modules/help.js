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
        var answer="Welcome to WormNet! If you have any problem, read this tutorial: http://www.tus-wa.com/forums/dos-help/newbie-guide-book-26874/ Read here about the available game modes: http://worms2d.info/Schemes With WormNet snooper you can chat and enter games easier: http://worms2d.info/Great_Snooper If you want to play league games, visit tus-wa.com";
        bot.pm(user.nick,answer);
    });
    
  
}