let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

// 关注用户
router.get('/user', function(req, res, next) {
    let sessionToken = req.cookies.sessionToken || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let following = AV.Object.createWithoutData('_User', req.query.userID);
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

// 关注问题
router.get('/question', function(req, res, next) {
    let sessionToken = req.cookies.sessionToken || null;
    if (!sessionToken) {
        res.status(403);
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let question = AV.Object.createWithoutData('Question', req.query.questionID);
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
router.get('/removeQuestion', function(req, res, next) {
    let {questionID} = req.query;
    let sessionToken = req.cookies.sessionToken || null;
    if (sessionToken) {
        AV.User.become(sessionToken).then((userMsg) => {
            let QuestionFollow = new AV.Query('QuestionFollow');
            let topic = AV.Object.createWithoutData('Question', questionID);
            QuestionFollow.equalTo('questionID', topic);
            QuestionFollow.equalTo('userID', userMsg);
            QuestionFollow.destroyAll().then(() => {
                let result = {statusMsg: 'success'};
                res.send(result);
            }).catch((err) => {
                console.log(err);
                res.status(403);
                res.send(err);
            })
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(403);
        res.send();
    }
})

// 关注话题
router.get('/topic', function(req, res, next) {
    let sessionToken = req.cookies.sessionToken || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let topic = AV.Object.createWithoutData('Topic', req.query.topicID);
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
// 取消关注话题
router.get('/removeTopic', function(req, res, next) {
    let {topicID} = req.query;
    let sessionToken = req.cookies.sessionToken || null;
    if (sessionToken) {
        AV.User.become(sessionToken).then((userMsg) => {
            let TopicFollow = new AV.Query('TopicFollow');
            let topic = AV.Object.createWithoutData('Topic', topicID);
            TopicFollow.equalTo('topicID', topic);
            TopicFollow.equalTo('userID', userMsg);
            TopicFollow.destroyAll().then(() => {
                let result = {statusMsg: 'success'};
                res.send(result);
            }).catch((err) => {
                console.log(err);
                res.status(403);
                res.send(err);
            })
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(403);
        res.send();
    }
})
module.exports = router;
