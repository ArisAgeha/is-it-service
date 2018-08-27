let express = require('express');
let router = express.Router();
let AV = require('../models/lc.js');

/* GET users listing. */
router.post('/signup', function(req, res, next) {
    let sessionToken = req.cookies.isLogin || null;
    if (sessionToken) {
        res.send({code: 2, message: 'has login.'});
        return;
    }
    let user = new AV.User();
    let {username, password} = req.body;
    user.signUp({
        username: username,
        password: password,
    }).then((data) => {
        res.send(data);
    }, (err) => {
        res.send(err);
    })
});

router.post('/login', (req, res, next) => {
    let {username, password} = req.body;
    AV.User.logIn(username, password).then((userMsg) => {
        res.cookie('sessionToken', userMsg._sessionToken, {maxAge: 2592000000});
        res.send(userMsg);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})

router.post('/loginByCookie', (req, res, next) => {
    let {sessionToken} = req.body;
    AV.User.become(sessionToken).then((userMsg) => {
        res.send(userMsg);
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
