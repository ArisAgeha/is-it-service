let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

/* GET users listing. */
router.post('/addComment', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let {answerID, hasReply, targetData, replyTo, replyQueue, content} = req.body;
        let comment = AV.Object('Comment');
        let answer = AV.Object.createWithoutData('Answer', answerID);
        comment.set('userID', userMsg);
        comment.set('answerID', answer);
        comment.set('hasReply', hasReply);
        comment.set('content', content);
        comment.set('replyTo', replyTo);
        comment.set('replyQueue', replyQueue);
        if (replyTo && !targetData.hasReply) {
            let replyObj = AV.Object.createWithoutData('Comment', targetData.id);
            replyObj.set('hasReply', true);
            replyObj.save().then((saveStatus) => {
                console.log(saveStatus);
            }).catch((err) => {
                console.log(err);
                res.send(err);
                return;
            })
        }
        comment.save().then((status) => {
            res.send(status);
        }).catch((err) => {
            res.send(status);
        })
    }).catch((err) => {
        console.log(err);
    });
});

module.exports = router;
