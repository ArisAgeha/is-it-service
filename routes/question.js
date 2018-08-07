let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

/* GET users listing. */
router.post('/addQuestion', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    AV.User.become(sessionToken).then((userMsg) => {
        let {title, topic, description} = req.body;
        let question = AV.Object('Question');
        question.set('userID', userMsg);

        question.save({title, topic, description}).then((status) => {
            let setQuestion = new AV.Object.createWithoutData('Question', status.id)
            let query = new AV.Query('Topic');
            query.containedIn('topicName', topic)
            query.find().then((results) => {
                let charts = {};
                let saveList = [];
                for (item of results) {
                    charts[item.attributes.topicName] = item.id;
                }
                for (let item of topic) {
                    let setTopic;
                    if (charts[item]) setTopic = new AV.Object.createWithoutData('Topic', charts[item]);
                    else {
                        setTopic = new AV.Object('Topic');   
                        setTopic.set('topicName', item);
                    }
                    let TopicQuestion = new AV.Object('TopicQuestion');
                    TopicQuestion.set('topicID', setTopic);
                    TopicQuestion.set('questionID', setQuestion);
                    saveList.push(TopicQuestion);
                }
                AV.Object.saveAll(saveList).then((status) => {
                    res.send(status);
                }).catch((err) => {
                    res.send(err);
                });
            }).catch((err) => {
                console.log(err)
            });
        });
    });

});

module.exports = router;
