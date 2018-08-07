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
    TopicQuestion.find().then((status) => {
        res.send(status);
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

module.exports = router;
