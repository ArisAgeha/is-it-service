let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

router.post('/addAnswer', function(req, res, next) {
    let sessionToken = req.cookies.sessionToken || null;
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

router.get('/addAgree', function(req, res, next) {
    let sessionToken = req.cookies.sessionToken || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let {answerID} = req.query;
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
router.get('/removeAgree', function(req, res, next) {
    let {answerID} = req.query;
    let sessionToken = req.cookies.sessionToken || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    if (sessionToken) {
        AV.User.become(sessionToken).then((userMsg) => {
            let Agree = new AV.Query('Agree');
            let answer = AV.Object.createWithoutData('Answer', answerID);
            Agree.equalTo('answerID', answer);
            Agree.equalTo('userID', userMsg);
            Agree.destroyAll().then(() => {
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
