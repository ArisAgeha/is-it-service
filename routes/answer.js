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
        let {ellipsis, content, agree, disagree, questionID} = req.body;
        let answer = AV.Object('Answer');
        let question = AV.Object.createWithoutData('Question', questionID);
        answer.set('userID', userMsg);
        answer.set('questionID', question);
        answer.save({ellipsis, content, agree, disagree}).then((status) => {
                let answerID = status.id;
                let answerproxy = AV.Object.createWithoutData('answer', answerID);
                let userAgree = AV.Object('Agree');
                let userDisagree = AV.Object('Disagree');
                userAgree.set('userID', userMsg);
                userAgree.set('answerID', answerproxy);
                userDisagree.set('userID', userMsg);
                userDisagree.set('answerID', answerproxy);
                let saveList = [userAgree, userDisagree];
                AV.Object.saveAll(saveList).then(status => {
                    res.send(status);
                }).catch(err => {
                    res.send(err);
                })
            })
    })
})

module.exports = router;
