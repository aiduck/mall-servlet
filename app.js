var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//数据库
var mongoose = require('./config/mongoose.js');
var db = mongoose();


var indexRouter = require('./routes/api/index');
var usersRouter = require('./routes/api/users');
var goodsRouter = require('./routes/api/goods');
//测试
var testUserRouter = require('./routes/testUser');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//全局拦截
app.use(function (req,res,next) {
  if(req.cookies.userId){
    next();
  }else{
      console.log("url:"+req.originalUrl);
      if(req.originalUrl=='/api/users/login' || req.originalUrl=='/api/users/logout' || req.originalUrl.indexOf('/api/goods/list')>-1){
          next();
      }else{
          res.json({
            status:'10001',
            msg:'当前未登录',
            result:''
          });
      }
  }
});

//一级路由
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/goods', goodsRouter);
//测试
app.use('/testUser',testUserRouter);


// catch 404 and forward to error handler
// 加载error对象，如果存在具体的error这加载具体的，不存在则使用默认的
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler error的处理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
