let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

router.post('/user', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let following = AV.Object.createWithoutData('_User', req.body.userID);
        let UserFollow = new AV.Object('UserFollow');
        UserFollow.set('userID', userMsg);
        UserFollow.set('followingID', following);
        UserFollow.save().then((status) => {
            console.log(status);
            res.send(status);
        }).catch((err) => {
            console.log(err);
            res.send(err);
        }) 
    }).catch(err => {
        console.log(err);
    })
})

router.post('/question', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let question = AV.Object.createWithoutData('Question', req.body.questionID);
        let QuestionFollow = new AV.Object('QuestionFollow');
        QuestionFollow.set('userID', userMsg);
        QuestionFollow.set('questionID', question);
        QuestionFollow.save().then((status) => {
            res.send(status);
        }).catch((err) => {
            console.log(err);
            res.send(err);
        })
    }).catch((err) => {
        console.log(err);
    })
})

router.post('/topic', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let topic = AV.Object.createWithoutData('Topic', req.body.topicID);
        let TopicFollow = new AV.Object('TopicFollow');
        TopicFollow.set('userID', userMsg);
        TopicFollow.set('topicID', topic);
        TopicFollow.save().then((status) => {
            res.send(status);
        }).catch((err) => {
            console.log(err);
            res.send(err);
        })
    }).catch((err) => {
        console.log(err);
    })
    
})
module.exports = router;
