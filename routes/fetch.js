let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

// 查询用户关注的人
router.post('/userFollowing', (req, res, next) => {
    let {userID, startIndex} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let UserFollow = new AV.Query('UserFollow');
    UserFollow.equalTo('userID', user);
    UserFollow.limit(limit);
    UserFollow.skip(startIndex);
    UserFollow.descending('createAt');
    UserFollow.include('followingID');
    UserFollow.find().then((status) => {
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})
// 查询关注该用户的人
router.post('/userFollower', (req, res, next) => {
    let {userID, startIndex} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let UserFollow = new AV.Query('UserFollow');
    UserFollow.equalTo('followingID', user);
    UserFollow.limit(limit);
    UserFollow.skip(startIndex);
    UserFollow.descending('createAt');
    UserFollow.include('userID');
    UserFollow.find().then((status) => {
        console.log(status);
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// 查询用户点赞的答案
router.post('/agree', (req, res, next) => {
    let {userID, startIndex} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let Agree = new AV.Query('Agree');
    Agree.equalTo('UserID', user);
    Agree.limit(limit);
    Agree.skip(startIndex);
    Agree.descending('createAt');
    Agree.include('answerID');
    Agree.find().then((status) => {
        console.log(status);
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})
// 查询用户反对的答案
router.post('/agree', (req, res, next) => {
    let {userID, startIndex} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let Agree = new AV.Query('Agree');
    Agree.equalTo('UserID', user);
    Agree.limit(limit);
    Agree.skip(startIndex);
    Agree.descending('createAt');
    Agree.include('answerID');
    Agree.find().then((status) => {
        console.log(status);
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// 查询首页内容
router.get('/index', async (req, res, next) => {
    let {startIndex} = req.query;
    let limit = 20;
    let query = new AV.Query('Question');
    query.find({
        descending: 'createAt',
        limit,
        skip: startIndex
    }).then((questionRes) => {
        getQuestionsAnswer(res, questionRes);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// 根据topicID查询question
router.post('/topicQuestion', (req, res, next) => {
    let {topicID, startIndex} = req.body;
    let limit = 20;
    let topic = AV.Object.createWithoutData('Topic', topicID);
    let TopicQuestion = new AV.Query('TopicQuestion');
    TopicQuestion.equalTo('topicID', topic);
    TopicQuestion.limit(limit);
    TopicQuestion.skip(startIndex);
    TopicQuestion.descending('createAt');
    TopicQuestion.include('questionID');
    TopicQuestion.find().then((questionRes) => {
        let extractedData = [];
        for (let item of questionRes) {
            extractedData.push(JSON.parse(JSON.stringify(item.attributes.questionID)));
        }
        getQuestionsAnswer(res, extractedData);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

router.post('/topicQuestion', (req, res, next) => {
    let {topicID, startIndex} = req.body;
    let limit = 20;
    let topic = AV.Object.createWithoutData('Topic', topicID);
    let TopicQuestion = new AV.Query('TopicQuestion');
    TopicQuestion.equalTo('topicID', topic);
    TopicQuestion.limit(limit);
    TopicQuestion.skip(startIndex);
    TopicQuestion.descending('createAt');
    TopicQuestion.include('questionID');
    TopicQuestion.find().then((status) => {
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

function getQuestionsAnswer(res, questionRes) {
    let isDone = 0;
    let results = JSON.parse(JSON.stringify(questionRes));
    for (item of results) {
        let tempItem = item;
        let question = AV.Object.createWithoutData('Question', tempItem.objectId);
        let queryAnswer = new AV.Query('Answer');
        queryAnswer.equalTo('questionID', question);
        queryAnswer.find({
            descending: 'createAt',
            limit: 1,
            include: 'userID'
        }).then((ansRes) => {
            for(let answer of ansRes) {
                let ansResult = JSON.parse(JSON.stringify(answer));
                tempItem.answer = ansResult;
                console.log(ansResult);
                console.log('-----')
                console.log(tempItem);
            }
            isDone++;
            if (isDone === results.length) {
                console.log(results[2])
                res.send(results);
            }
        }).catch(err => {
            console.log(err);
        })
    }
}
module.exports = router;
