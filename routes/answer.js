let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

router.post('/addAnswer', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let {ellipsis, content, questionID} = req.body;
        let answer = AV.Object('Answer');
        let question = AV.Object.createWithoutData('Question', questionID);
        answer.set('userID', userMsg);
        answer.set('questionID', question);
        answer.save({ellipsis, content}).then((results) => {
            res.send(results);
        }).catch((err) => {
            console.log(err);
            res.send(err);
        })
    }).catch(err => {
        console.log(err);
    })
})

router.post('/addAgree', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let {answerID} = req.body;
        let answer = AV.Object.createWithoutData('Answer', answerID);
        let AgreeMap = new AV.Object('Agree');
        AgreeMap.set('answerID', answer);
        AgreeMap.set('userID', userMsg);
        AgreeMap.save().then((results) => {
            res.send(results);
        }).catch((err) => {
            console.log(err);
        })
    })
})

module.exports = router;
