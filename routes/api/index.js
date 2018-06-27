var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //render自动加载views下面的文件 就是views下面的index
  //app.set('views', path.join(__dirname, 'views'));
  //这个就是设置默认访问views的
  //views 中index传入参数就是Express
  res.render('index', { title: 'Express'});
});

module.exports = router;
