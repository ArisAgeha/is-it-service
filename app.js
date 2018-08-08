var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var questionRouter = require('./routes/question.js');
var userRouter = require('./routes/user.js');
var answerRouter = require('./routes/answer.js');
var followRouter = require('./routes/follow.js');
var commentRouter = require('./routes/comment.js');
var fetchRouter = require('./routes/fetch.js');
var cookieParser = require('cookie-parser');
var cors = require('cors')
let bodyParser = require('body-parser');

var app = express();
//// cookie
//app.use(cookieParser());
//
//// 处理跨域请求
//let bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//
//app.use(function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//  next();
//});
//
//app.use(cors({credentials: true, origin: 'http://localhost:8080'}));
//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080'); //必须重新设置，把origin的域加上去
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'x-custom, Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');//和客户端对应，必须设置以后，才能接收cookie.
    next();
};

app.use(allowCrossDomain);
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------------------------------------------- */

app.use('/question', questionRouter);
app.use('/user', userRouter);
app.use('/answer', answerRouter);
app.use('/follow', followRouter);
app.use('/comment', commentRouter);
app.use('/fetch', fetchRouter);

/* ---------------------------------------------------- */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
