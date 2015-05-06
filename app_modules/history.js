var mongoose = require('mongoose'),
    models = require('./../models'),
    User = models.userModel,
    Event = models.eventModel,
    moment=require("moment"),
    async = require("async");


    exports.initialize = function(bot) {
    logEvents(bot);
	}

function logEvents(bot) {

	bot.on("message", function(from, to, message) {
       if (message.indexOf("!lastmessage")!=-1 || message.indexOf("!lastaction")!=-1){
       	message=message.split(" ");
       	for (var i=0;i<message.length;i++){
       	if (message[i]=="!lastmessage" && i+1<message.length){
       		var nick=message[i+1];
       		Event.findLastMessageByUser(nick,function(err,event){
       			var answer;
       			console.log(event);
       			if (err) {answer="Could not get user message "+nick+ ", error: "+err;}
       			else{
       			answer=nick+" wrote "+moment(new Date(event.date)).fromNow()+ " to "+ event.to + ": "+event.message;
       			}
       			bot.speak(to,answer);
       		})
       	} else if(message[i]=="!lastaction" && i+1<message.length){

       				var nick=message[i+1];
       		Event.findLastActionByUser(nick,function(err,event){
       			var answer;
       			console.log(event);
       			if (err) {answer="Could not get user action "+nick+ ", error: "+err;}
       			else{
       			answer=nick+", action:"+event.type+", time:"+moment(new Date(event.date)).fromNow()+ ", to:"+ event.to + ", message:"+event.message;
       			}
       			bot.speak(to,answer);
       		})

       	}
       	}
       }
    })


}