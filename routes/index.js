var express = require('express'),
    router = express.Router(),
    models = require('../models'),
    User = models.userModel,
    Event = models.eventModel;

/* GET home page. */
router.get('/user/', function(req, res, next) {
    console.log("yo");
    Event.aggregate(
        [{
            "$match": {
                "type": "message"
            }
        }, {
            "$group": {
                "_id": "$user",
                "count": {
                    "$sum": 1
                },
                "origId": {
                    "$first": "$_id"
                }
            }},
            {
                "$sort": {
                    "count": -1
                }
            },
            {
                "$limit": 50
            }
        ], function(err, origEv) {
            //console.log(err,res);
            var events = origEv.map(function(doc) {
                doc.user = doc._id;
                doc._id = doc.origId;
                doc.count = doc.count;
                delete doc.origId;
                return new Event(doc)
            });
            User.populate(events, {
                "path": "user"
            }, function(err, users) {
                if (err) throw err;
                //console.log( JSON.stringify( users, undefined, 4 ) );
                //console.log(users);
                // console.log(users[0]._id, events[0].count);
                var renders = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].user) {
                        var idU = users[i]._id;


                        for (var j = 0; j < origEv.length; j++) {
                            var idE = origEv[j]._id;
                            if (idU == idE) {
                                //console.log('found');
                                var elem = {};
                                elem.nick = users[i].user.nick
                                elem.count = origEv[j].count;
                                //console.log(elem.count);
                                renders.push(elem);
                            }

                        }
                    }


                }
                renders = renders.sort(function(a, b) {
                    return (a.nick > b.nick) ? 1 : ((b.nick > a.nick) ? -1 : 0);
                });
                res.render('index', {
                    title: 'WA bot',
                    users: renders
                });
            });

        })


});

/* GET user history page. */
router.get('/user/:user', function(req, res, next) {
    var nick = req.params.user;
    User.findOne({
        nick: nick
    }, function(err, us) {
        console.log(err, us);
        if (us && us.id) {
            var id = us.id;
            Event
                .find({
                    user: id
                }).populate('user').exec(function(err, ev) {
                    console.log('The creator elem is', ev, us);
                    res.render('userHistory', {
                        ev: ev
                    });

                });
        } else {
            res.render('userHistory', {
                ev: null
            });
        }
    })


});
module.exports = router;