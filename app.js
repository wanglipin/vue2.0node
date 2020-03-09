var createError = require('http-errors');
var express = require('express');
var path = require('path'); // 路径
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require("body-parser")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
const fileRouter = require('./routes/file')
const  cors = require("cors");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const { redisClient } = require('./db/redis')
const seeionStore = new RedisStore({
  client: redisClient
})
app.use(session({
  secret: 'wang_li_PIN1',
  cookie: {
    // path: '/',//  不写也可以默认配置
    // httpOnly: true, // 禁止客户端获取和修改cookie,不写也可以，默认配置
    maxAge: 24 * 60 * 60 *1000,
    store: seeionStore // 用redis存储session，如果不设置则存储到内存中
  },
  resave: true,
  saveUninitialized: true 
}))

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get("/", function(req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

app.use('/user', usersRouter);
app.use('/file', fileRouter)

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
app.listen(3001, () => {
  console.log('express app is running.....')
})
module.exports = app;
