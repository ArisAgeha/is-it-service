let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');
let {getCountFromPointer, getCountFromMap} = require('../models/getCount.js');

// 首页
// 查询首页内容
router.get('/index', async (req, res, next) => {
    console.log(getCountFromPointer)
    console.log(getCountFromMap)
    let {skip} = req.query;
    let limit = 20;
    let query = new AV.Query('Question');
    query.find({
        descending: 'createdAt',
        limit,
        skip: skip
    }).then((questionRes) => {
        getQuestionsAnswer(req, res, questionRes, 1);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// 查询用户关注的人
router.post('/userFollowing', (req, res, next) => {
    let {userID, skip} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let UserFollow = new AV.Query('UserFollow');
    UserFollow.equalTo('userID', user);
    UserFollow.limit(limit);
    UserFollow.skip(skip);
    UserFollow.descending('createdAt');
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
    let {userID, skip} = req.body;
    let limit = 20;
    let user = AV.Object.createWithoutData('_User', userID);
    let UserFollow = new AV.Query('UserFollow');
    UserFollow.equalTo('followingID', user);
    UserFollow.limit(limit);
    UserFollow.skip(skip);
    UserFollow.descending('createdAt');
    UserFollow.include('userID');
    UserFollow.find().then((status) => {
        console.log(status);
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})
//查询用户详情
router.post('userDetail', (req, res, next) => {
    let {userID} = res.body;
    
})

// Topic页
// 查询用户关注的话题
router.get('/topic', (req, res, next) => {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let query = new AV.Query('TopicFollow');
        query.equalTo('userID', userMsg);
        query.include('topicID');
        query.find().then((map) => {
            let extractedData = [];
            map.forEach(function(item) {
                extractedData.push(item.attributes.topicID);
            })
            res.send(extractedData);
        })
    })
})
// 根据topicID查询question
router.post('/topicQuestion', (req, res, next) => {
    let {topicID, skip} = req.body;
    let limit = 20;
    let topic = AV.Object.createWithoutData('Topic', topicID);
    let TopicQuestion = new AV.Query('TopicQuestion');
    TopicQuestion.equalTo('topicID', topic);
    TopicQuestion.limit(limit);
    TopicQuestion.skip(skip);
    TopicQuestion.descending('createdAt');
    TopicQuestion.include('questionID');
    TopicQuestion.find().then((questionRes) => {
        let extractedData = [];
        for (let item of questionRes) {
            extractedData.push(item.attributes.questionID);
        }
        getQuestionsAnswer(req, res, extractedData, 1);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// question页
// 获取问题详情
router.post('/questionPage', (req, res, next) => {
    let {questionID, skip} = req.body;
    let limit = 20;
    let question = AV.Object.createWithoutData('Question', questionID);
    question.fetch().then((questionRes) => {
        let extractedData = [questionRes];
        getQuestionsAnswer(req, res, extractedData, limit, skip);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

function getQuestionsAnswer(req, res, questionRes, limit, skip) {
    limit = limit || 1;
    skip = skip || 0;
    let isDone = 0;
    let results = JSON.parse(JSON.stringify(questionRes));
    for (let i = 0; i < results.length; i++) {
        let tempItem = results[i];
        let queryAnswer = new AV.Query('Answer');
        queryAnswer.equalTo('questionID', questionRes[i]);
        queryAnswer.descending('createdAt');
        queryAnswer.limit(limit);
        queryAnswer.skip(skip);
        queryAnswer.include('userID');
        queryAnswer.find().then(async (ansRes) => {
            let answers = [];
            for(let answer of ansRes) {
                let commentCount = 0;
                let agreeCount = 0;
                let isAgree = false;
                // 如果有回答
                if (ansRes.length) {
                    // 获取回答的评论数量
                    let answerID = answer.id;
                    commentCount = await getCountFromPointer({
                        parentID: answerID,
                        parentClassName: 'Answer',
                        childClassName: 'Comment',
                        dependent: 'answerID'
                    })
                    agreeCount = await getCountFromMap({
                        queryClassName: 'Answer',
                        queryClassID: answerID,
                        mapName: 'Agree',
                        dependent: 'answerID'
                    })
                    // 检查当前用户是否点赞
                    let sessionToken = req.cookies.isLogin || null;
                    if (sessionToken) {
                        let user = await AV.User.become(sessionToken);
                        let AgreeMap = new AV.Query('Agree');
                        AgreeMap.equalTo('answerID', answer);
                        AgreeMap.equalTo('userID', user);
                        let currentUserAgree = await AgreeMap.count();
                        isAgree = currentUserAgree? true: false;
                    }
                }
                let ansResult = JSON.parse(JSON.stringify(answer));
                ansResult.isAgree = isAgree;
                ansResult.commentCount = commentCount;
                ansResult.agreeCount = agreeCount;
                answers.push(ansResult);
            }
            tempItem.answers = answers;
            isDone++;
            if (isDone === results.length) {
                res.send(results);
            }
        }).catch(err => {
            console.log(err);
        })
    }
}
module.exports = router;
