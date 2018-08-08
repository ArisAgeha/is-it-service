let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

/* GET users listing. */
router.post('/signup', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (sessionToken) {
        res.send({code: 2, message: 'has login.'});
    }
    let user = new AV.User();
    let {username, password} = req.body;
    user.signUp({
        username: username,
        password: password,
        agree: 0,
        question: 0,
        answer: 0,
        lastCheck: 0
    }).then((data) => {
        res.send(data);
    }, (err) => {
        res.send(err);
    })
});

router.post('/login', (req, res, next) => {
    let {username, password} = req.body;
    AV.User.logIn(username, password).then((status) => {
        res.cookie('isLogin', status._sessionToken);
        res.cookie('userID', status.id);
        res.send(status);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

router.delete('/logout', (req, res, next) => {
    let sessionToken = req.cookies.isLogin || null;
    if (!sessionToken) {
        res.send({code: 1, message: 'not login.'});
        return;
    }
    res.clearCookie('isLogin');
    res.clearCookie('userID');
    res.send('logout');
})

module.exports = router;
