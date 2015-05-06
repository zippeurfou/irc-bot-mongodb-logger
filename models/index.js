//Note
//In a perfect world I would have made one file per Schema but this being just a proof of concept app, I tried to be quicker and putted everything in the same file
//You can notice that similar has the same structure for TagSchema and ArtistSchema
//I decided to not create a new field Schema for it as I actually don't need to access specific node
// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//Everything as a string because they can actually trick irc to whatever they want to.
var UserSchema = new Schema({
    nick: String,
    right: String,
    countryCode: String,
    countryName: String,
    rank: String,
    clientName: String
});


var EventSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: String,
    to: String,
    message: String,
    date: {
        type: Date,
        default: Date.now
    }

});

EventSchema.statics.findLastMessageByUser = function(nick, cb) {
    return mongoose.model('User').findOne({
        nick: nick
    }, function(err, us) {
        if (err) {
            cb(err, null);
        } else if (us === null) {
            cb("user not found", null);
        } else {
            var id = us.id;
            mongoose.model('Event')
                .find({
                    user: id,
                    type: "message"
                }).sort({
                    "date": -1
                }).limit(1).exec(function(err, event) {
                    if (err) {
                        cb(err, null);
                    } else if (event.length== 0) {
                        cb("user found but did not write any message", null)
                    } else {
                      cb(null,event[0]);
                    }
                });
        }
    });
}

EventSchema.statics.findLastActionByUser = function(nick, cb) {
    return mongoose.model('User').findOne({
        nick: nick
    }, function(err, us) {
        if (err) {
            cb(err, null);
        } else if (us === null) {
            cb("user not found", null);
        } else {
            var id = us.id;
            mongoose.model('Event')
                .find({
                    user: id,
                    type: {'$ne':"who" }
                }).sort({
                    "date": -1
                }).limit(1).exec(function(err, event) {
                    if (err) {
                        cb(err, null);
                    } else if (event.length== 0) {
                        cb("user found but did not had any action", null)
                    } else {
                      cb(null,event[0]);
                    }
                });
        }
    });
}





//We export it so we can use it with require('./models')
exports.userModel = mongoose.model('User', UserSchema);
exports.eventModel = mongoose.model('Event', EventSchema);