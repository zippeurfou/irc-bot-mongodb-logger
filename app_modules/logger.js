//Log everything in mongodb

var mongoose = require('mongoose'),
    models = require('./../models'),
    User = models.userModel,
    Event = models.eventModel,
    async = require("async");

exports.initialize = function(bot) {
    logEvents(bot);
    bot.getAllUsersList();
}


function logEvents(bot) {
    var channels = ["#AnythingGoes", "#Help","#PartyTime","#RopersHeaven"];
    async.each(channels, function(channel, callback) {
        bot.who(channel, function(users) {
            var obj = {};
            var onlines = [];
            for (var nick in users.nicks) {
                obj = users.nicks[nick];
                obj.nick = nick;
                onlines.push(obj);
            }
            console.log("found onlines in "+channel+" "+onlines.length);
            async.each(onlines, function(online, cb) {
                getUser(channel, online.nick, online.nick_status, online.gecos, function(err,userdb) {
                    cb();

                })
            }, function(err) {
                console.log("end for getting ",channel);
                callback();

            })

        })


    }, function(err) {
            console.log("end getting info on channels");
        });

    bot.on("message", function(from, to, message) {
        handleBotQuery("message", from, to, message);
    })

    bot.on('quit', function(nick, reason, channels, message) {
        for (var i = 0; i < channels.length; i++) {
            handleBotQuery('quit', nick, channels[i], reason);
        }
    });

    bot.on('part', function(nick, reason, channel, message) {
        handleBotQuery('part', nick, channel, reason);

    });

    //kick listenner	
    bot.on('kick', function(nick, reason, channel, message) {
        handleBotQuery('kick', nick, channel, reason);

    });

    bot.on('join', function(channel, nick, message) {
        handleBotQuery('join', nick, channel, message);
    });


    bot.on('pm', function(from, message) {
        var to = bot.getNick();
        handleBotQuery('pm', from, to, message);
    });


    bot.on('kill', function(nick, reason, channels, message) {
        for (var i = 0; i < channels.length; i++) {
            handleBotQuery('kill', nick, channels[i], reason);
        }
    });


    function handleBotQuery(type, from, to, message) {
        //TODO Test if a PM got here
        console.log("handleQuery ",type, from,to,message);
        User.findOne({
            nick: from
        }, function(err, obj) {
            if (err) {
                console.err("Error in getting " + from, err);
            } else {

                var found = obj ? true : false;
                //not in db
                if (!found) {
                    if (to && from) {
                        //do a who query
                        //TODO take care of quit event type
                        console.log("doing who for "+from+' '+to+" type is "+type);
                        bot.who(from + " " + to, function(botuser) {
                            if (botuser){
                            var nick = botuser.nick;
                            var channel = to;
                            var right = botuser.nick_status;
                            var gecos = botuser.gecos;
                            getUser(channel, nick, right, gecos, function(err,dbuser) {
                                var obj={};
                                if (type) obj.type = type;
                                if (to) obj.to = to;
                                if (message) obj.message = message;
                                if (dbuser.id) obj.user = dbuser.id;
                                var ev = new Event(obj);
                                ev.save(function(err) {
                                    if (err) console.error("error while saving ev", ev, err);
                                });

                            })
                            }
                            else{
                                console.warn("ignored who for "+from+' '+to+" type is "+type);
                            }
                        })
                    }
                }
                //Shouldn't ignore the message..
                else {
                    var fromId = obj.id;
                    var obj = {};
                    if (type) obj.type = type;
                    if (fromId) obj.user = fromId;
                    if (to) obj.to = to;
                    if (message) obj.message = message;
                    var ev = new Event(obj);
                    ev.save(function(err) {
                        if (err) console.error("error while saving ev", ev, err);
                    });
                }


            }
        });
    }


    function getUser(channel, nick, right, gecos, callback) {


        var split = gecos.split(" ");
        var countryCode, countryName, rank, clientName;
        if (split.length > 0) {
            if (isNaN(split[0])) {
                //nick=split[1];
                if (split.length > 1) {
                    var tmp = "";
                    for (var i = 1; i < split.length; i++) {
                        tmp += split[i];
                    }
                    clientName = tmp;
                }

            } else {
                countryCode = split[0];
                if (split.length > 2) {
                    rank = split[1];
                    countryName = split[2];
                    if(split.length > 3){
                    var tmp = "";
                    for (var i = 3; i < split.length; i++) {
                        tmp += split[i];
                    }
                    clientName = tmp;
                    }


                } else {

                    console.warn("special case for who could not get it",channel, nick, right, gecos );


                }

            }


        }
        var userUpdate = {};
        if (nick) userUpdate.nick = nick;
        if (right) userUpdate.right = right;
        if (countryCode) userUpdate.countryCode = countryCode;
        if (countryName) userUpdate.countryName = countryName;
        if (rank) userUpdate.rank = rank;
        if (clientName) userUpdate.clientName = clientName;
        User.update({
            nick: nick
        }, userUpdate, {
            upsert: true
        }, function(err, numberAffected, rawResponse) {

            if (err) {
                console.error("error while updating ", nick, err);
            } else if (!rawResponse.updatedExisting) {

                var ev = new Event({
                    to: channel,
                    user: rawResponse.upserted[0]._id,
                    type: "new user"
                });
                ev.save(function(err) {
                    if (err) console.error("error while saving ev", ev, err);
                    bot.emit("new user", userUpdate);
                    console.log("new user ");
                    callback(null, userUpdate);
                });
            } else {
                User.findOne({
                    nick: nick
                }, function(err, us) {
                    var id = us.id;
                    var ev = new Event({
                        to: channel,
                        user: id,
                        type: "who"
                    });
                    ev.save(function(err) {
                        if (err) console.error("error while saving ev", ev, err);
                        callback(null, us);
                    });



                })
            }
          
        });

    }


}