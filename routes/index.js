var express = require('express'),
    router = express.Router(),
    models = require('../models'),
    User = models.userModel,
    Event = models.eventModel;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'LastFm playground app'
    });
});

/* GET user history page. */
router.get('/:user', function(req, res, next) {
    var nick = req.params.user;
    User.findOne({
        nick: nick
    }, function(err, us) {
        console.log(err, us);
        var id = us.id;
        Event
            .find({
                user: id
            }).exec(function(err, ev) {
                console.log('The creator elem is', ev, us);
                res.render('userHistory', {
                    ev: ev
                });

            });



    })


});
module.exports = router;