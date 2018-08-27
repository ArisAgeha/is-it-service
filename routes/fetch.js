let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');
let {getCountFromPointer, getCountFromMap} = require('../models/getCount.js');

// 首页
// 查询首页内容
router.get('/index', async (req, res, next) => {
    let {skip} = req.query;
    let limit = 20;
    let query = new AV.Query('Question');
    query.descending('createdAt');
    query.skip(skip);
    query.limit(limit)
    query.find().then((questionRes) => {
        if (!questionRes[0]) {
            res.status(403);
            res.send();
        }
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
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})
//查询用户详情
router.post('/userDetail', (req, res, next) => {
    let {userID} = req.body;
    let userObj = AV.Object.createWithoutData('_User', userID);
    userObj.fetch().then(async (userRes) => {
        let answerCount = await getCountFromPointer({
            'parentID': userID,
            'parentClassName': '_User',
            'childClassName': 'Answer',
            'dependent': 'userID'
        })
        let questionCount = await getCountFromPointer({
            'parentID': userID,
            'parentClassName': '_User',
            'childClassName': 'Question',
            'dependent': 'userID'
        })
        let followerCount = await getCountFromMap({
            'queryClassName': '_User',
            'queryClassID': userID,
            'mapName': 'UserFollow',
            'dependent': 'followingID'
        })
        let followingCount = await getCountFromMap({
            'queryClassName': '_User',
            'queryClassID': userID,
            'mapName': 'UserFollow',
            'dependent': 'userID'
        })
        let user = JSON.parse(JSON.stringify(userRes));
        user.answerCount = answerCount;
        user.questionCount = questionCount;
        user.followerCount = followerCount;
        user.followingCount = followingCount;
        res.send(user);
    }).catch(err => {
        console.log(err);
    }) 
})

// Topic页
// 查询用户关注的话题
router.get('/topic', (req, res, next) => {
    let sessionToken = req.cookies.sessionToken || null;
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
// Topics页
// 查询所有话题
router.get('/topics', (req, res, next) => {
    let query = new AV.Query('Topic');
    query.ascending('createdAt');
    query.find().then((topics) => {
        res.send(topics);
    }).catch((err) => {
        console.log(err);
        res.status(403);
        res.send(err);
    })
})
// 根据topicID查询question
router.get('/topicQuestion', (req, res, next) => {
    let {topicID, skip} = req.query;
    let limit = 20;
    let topic = AV.Object.createWithoutData('Topic', topicID);
    let TopicQuestion = new AV.Query('TopicQuestion');
    TopicQuestion.equalTo('topicID', topic);
    TopicQuestion.limit(limit);
    TopicQuestion.skip(skip);
    TopicQuestion.descending('createdAt');
    TopicQuestion.include('questionID');
    TopicQuestion.find().then((questionRes) => {
        if (questionRes.length === 0) {
            res.status(403);
            res.send();   
            return;
        }
        let extractedData = [];
        for (let item of questionRes) {
            extractedData.push(item.attributes.questionID);
        }
        getQuestionsAnswer(req, res, extractedData, 1);
    }).catch((err) => {
        console.log(err);
        res.status(403);
        res.send(err);
    }).catch((err) => {
        console.log(err);
        res.status(403);
        res.send(err);
    })
})
router.get('/topicIsFollow', (req, res, next) => {
    let {topicID} = req.query;
    let sessionToken = req.cookies.sessionToken || null;
    if (sessionToken) {
        AV.User.become(sessionToken).then((userMsg) => {
            let TopicFollow = new AV.Query('TopicFollow');
            let topic = AV.Object.createWithoutData('Topic', topicID);
            TopicFollow.equalTo('topicID', topic);
            TopicFollow.equalTo('userID', userMsg);
            TopicFollow.find().then((followMsg) => {
                let isFollow = followMsg[0]? true: false;
                res.send(isFollow);
            }).catch((err) => {
                console.log(err);
                res.status(403);
                res.send(err);
            })
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.send('false');
    }
})

// question页
// 获取问题详情
router.get('/questionPage', (req, res, next) => {
    let {questionID, skip} = req.query;
    let limit = 20;
    let question = AV.Object.createWithoutData('Question', questionID);
    let sessionToken = req.cookies.sessionToken || null;
    question.fetch().then((questionRes) => {
        let extractedData = [questionRes];
        getQuestionsAnswer(req, res, extractedData, limit, skip, sessionToken);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// 获取评论
router.get('/comment', (req, res, next) => {
    let {answerID, skip} = req.query;
    let limit = 20;
    let answer = AV.Object.createWithoutData('Answer', answerID);
    let queryComment = new AV.Query('Comment');
    queryComment.descending('createdAt');
    queryComment.equalTo('answerID', answer);
    queryComment.skip(skip);
    queryComment.limit(limit);
    queryComment.include('userID');
    queryComment.find().then((comment) => {
        res.send(comment);
    })
})

// 获取评论对话
router.get('/dialog', (req, res, next) => {
    let {queueID} = req.query;
    let firstCommentObj = new AV.Query('Comment');
    firstCommentObj.equalTo('objectId', queueID);
    firstCommentObj.include('userID');
    firstCommentObj.find().then((firstComment) => {
        let commentsObj = new AV.Query('Comment');
        commentsObj.equalTo('replyQueue', queueID);
        commentsObj.ascending('createdAt');
        commentsObj.include('userID');
        commentsObj.find().then((comments) => {
            comments.unshift(firstComment[0]);
            res.send(comments);
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
})

async function getQuestionsAnswer(req, res, questionRes, limit, skip, sessionToken) {
    let isFollow = false;
    if (sessionToken) {
        let user = await AV.User.become(sessionToken);
        let query = new AV.Query('QuestionFollow');
        let question = AV.Object.createWithoutData('Question', questionRes[0].id);
        query.equalTo('userID', user);
        query.equalTo('questionID', question);
        let res = await query.find();
        isFollow = res[0]?true: false;
    }
    limit = limit || 1;
    skip = skip || 0;

    let results = JSON.parse(JSON.stringify(questionRes));
    if (results.length > 0) results[0].isFollow = isFollow;
    let isDoneA = 0;
    let isDoneB = 0;
    let doneCountA = results.length;
    let doneCountB = 0;
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
            doneCountB += ansRes.length * 3;
            for(let answer of ansRes) {
                let ansResult = JSON.parse(JSON.stringify(answer));
                let commentCount = 0;
                let agreeCount = 0;
                // 如果有回答
                // 获取回答的评论数量
                let answerID = answer.id;
                getCountFromPointer({
                    parentID: answerID,
                    parentClassName: 'Answer',
                    childClassName: 'Comment',
                    dependent: 'answerID'
                }).then((commentCount) => {
                    ansResult.commentCount = commentCount;
                    isDoneB++;
                    if (isDoneA === doneCountA && isDoneB === doneCountB) {
                        res.send(results);
                    }
                })
                getCountFromMap({
                    queryClassName: 'Answer',
                    queryClassID: answerID,
                    mapName: 'Agree',
                    dependent: 'answerID'
                }).then((agreeCount) => {
                    ansResult.agreeCount = agreeCount;
                    isDoneB++;
                    if (isDoneA === doneCountA && isDoneB === doneCountB) {
                        res.send(results);
                    }
                })
                // 检查当前用户是否点赞
                let sessionToken = req.cookies.sessionToken || null;
                if (sessionToken) {
                    AV.User.become(sessionToken).then((user) => {
                        let AgreeMap = new AV.Query('Agree');
                        AgreeMap.equalTo('answerID', answer);
                        AgreeMap.equalTo('userID', user);
                        AgreeMap.count().then((currentUserAgree) => {
                            let isAgree = currentUserAgree? true: false;
                            ansResult.isAgree = isAgree;
                            isDoneB++;
                            if (isDoneA === doneCountA && isDoneB === doneCountB) {
                                res.send(results);
                            }
                        });
                    });
                } else {
                    isDoneB++;
                    if (isDoneA === doneCountA && isDoneB === doneCountB) {
                        res.send(results);
                    }
                }
                answers.push(ansResult);
            }
            tempItem.answers = answers;
            isDoneA++;
            if (isDoneA === doneCountA && isDoneB === doneCountB) {
                res.send(results);
            }
        }).catch(err => {
            console.log(err);
        })
    }
}


module.exports = router;
