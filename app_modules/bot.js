var events = require("events");
var EventEmitter = events.EventEmitter;
var irc = require("./irc/lib/irc");
var util = require("util");

/**
 * Create the bot listnner
 * TODO add more channels
 * @param {string} username of the bot
 * @param {string} hostname of the irc
 * @param {string} password password of the irc
 */
function Bot(username, hostname, password, channels, callback) {
    var that = this;
    EventEmitter.call(that);
    create_client(username, hostname, password, channels, function(client) {
        subscribe_events(client, that);
        createPrototypes(client, that);
        callback(that);
    });
}

util.inherits(Bot, EventEmitter);


function create_client(username, hostname, password, channels, callback) {
    //creation of client with info to connect to wa irc
    var c = new irc.Client(hostname, username, {
        channels: channels,
        sasl: true,
        username: "",
        password: password,
        floodProtection: true,
        floodProtectionDelay: 1000 * 4,
        messageSplit: 200,
        autoConnect: true
    });
    c.addListener('registered', function(message) {
        callback(c);
    });

}



function subscribe_events(client, that) {
    //message listenner
    client.addListener('message', function(from, to, message) {
        that.emit('message', from, to, message);

    });
    //connection listenner
    client.addListener('names', function(channel, names) {
        that.emit('names', channel, names);
    });

    //quit listenner
    client.addListener('quit', function(nick, reason, channels, message) {
        that.emit('quit', nick, reason, channels, message);
    });

    //part listenner
    client.addListener('part', function(nick, reason, channels, message) {
        that.emit('part', nick, reason, channels, message);
    });

    //kick listenner	
    client.addListener('kick', function(nick, reason, channels, message) {
        that.emit('kick', nick, reason, channels, message);
    });


    //join listenner	
    client.addListener('join', function(channels, nick, message) {
        that.emit('join', channels, nick, message);

    });

    //error listenner	
    client.addListener('error', function(message) {
        console.log("there is an error ",message);
       // that.emit('error', message);
    });

    //pm listenner	
    client.addListener('pm', function(from, message) {
        that.emit('pm', from, message);
    });


    //kill listenner
    client.addListener('kill', function(nick, reason, channels, message) {
        that.emit('kill', nick, reason, channels, message);
    });

    //whois listenner
    client.addListener('whois', function(info) {
        that.emit('whois', info);
    });

    client.addListener('who', function(info) {
        that.emit('who', info);
    });
    client.addListener('raw', function(info) {
        that.emit('raw', info);
        if (info.command == "rpl_whoreply") {
            that.emit('who reply', info);
        } else if (info.command == "rpl_namreply") {
            var channel = info.args[2];
            var names = info.args[3].split(" ");
            that.emit("names reply", channel, names);
        }
    });



}

function createPrototypes(client, that) {
    Bot.prototype.speak = function(channel, message) {
        client.say(channel, message);

    }

    Bot.prototype.pm = function(username, message) {
        client.send("PRIVMSG", username, message);
    }



    Bot.prototype.getUserInfo = function(channel, username) {
        client.send("WHO " + username, channel);
    }


    Bot.prototype.getAllUsersList = function() {
        client.send("NAMES");
    }

    Bot.prototype.getNick = function() {
        return client.nick;
    };

    Bot.prototype.who = function(nick, callback) {
        return client.who(nick, callback);
    };

    Bot.prototype.listenMessage = function(listenner) {
        client.on("message", function(from, to, message) {
            if (listenner && message.indexOf(listenner) != -1) {
                console.log("listnner is",listenner,'emit');
                that.emit('message:' + listenner, from, to, message);
            }
        });
    }




}



module.exports = Bot;