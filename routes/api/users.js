var express = require('express');
var router = express.Router();
// 引入工具类
require('./../../util/util')
// 引入模型
var Goods = require('./../../models/goods');
var User = require('./../../models/user');
/* 二级路由 子路由*/ 
/* GET users listing. */

router.get('/', function(req, res, next) {
  console.log("welcome to user");
});
//查询是否登陆
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
      res.json({
        status:'200',
        msg:'',
        result:req.cookies.userName
      });
  }else{
    res.json({
      status:'500',
      msg:'未登录',
      result:''
    });
  }
});
//登录
router.post('/login',function(req,res,next){
  var param = {
    userName:req.body.userName,
    userPwd:req.body.userPwd
  }
  User.findOne(param,(err,doc)=>{
    if(err){
      res.json({
        status:'500',
        msg:err.msg
      });
    }else{
      if(doc){
        //cookie 服务器端的
        res.cookie("userId",doc.userId,{
          path:'/',
          maxAge:1000*60*60
        });
        res.cookie("userName",doc.userName,{
          path:'/',
          maxAge:1000*60*60
        });
        //session  是客户端发过来的session  
        //req.session.user = doc;
        res.json({
          status:'200',
          msg:'',
          result:{
            userName:doc.userName
          }
        });
      }
    }
  });
});
//登出
router.post("/logout",function(req,res,next){
  res.cookie("userId","",{
    path:"/",
    maxAge:-1,
  });
  res.cookie("userName","",{
    path:"/",
    maxAge:-1,
  });
  res.json({
    status:'200',
    msg:'',
    result:'',
  });
});
//统计购物车数量
router.get("/getCartCount", function (req,res,next) {
  if(req.cookies && req.cookies.userId){
    console.log("userId:"+req.cookies.userId);
    var userId = req.cookies.userId;
    User.findOne({"userId":userId}, function (err,doc) {
      if(err){
        res.json({
          status:"500",
          msg:err.message
        });
      }else{
        let cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(function(item){
          cartCount += parseFloat(item.productNum);
        });
        res.json({
          status:"200",
          msg:"",
          result:cartCount
        });
      }
    });
  }else{
    res.json({
      status:"500",
      msg:"当前用户不存在"
    });
  }
});

//查询当前用户购物车列表
router.get("/cartList",function(req,res,next){
  var userId = req.cookies.userId;
  //测试
  //var userId = '100000077';
  User.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'500',
          msg:err.message,
          result:''
        });
      }else{
          if(doc){
            res.json({
              status:'200',
              msg:'',
              result:doc.cartList
            });
          }
      }
  });
});
//购物车删除
router.post("/cartDel", function (req,res,next) {
  var userId = req.cookies.userId,
  productId = req.body.productId;

  User.update({
    userId:userId
  },{
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  }, function (err,doc) {
    if(err){
      res.json({
        status:'500',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'200',
        msg:'',
        result:'suc'
      });
    }
  });
});
//修改商品数量
router.post("/cartEdit", function (req,res,next) {
  var userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  console.log(userId);
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked,
  }, function (err,doc) {
    if(err){
      res.json({
        status:'500',
        msg:"数据库操作错误",
        result:''
      });
    }else{
      res.json({
        status:'200',
        msg:'',
        result:'suc'
      });
    }
  })
});

//全部选中购物车
router.post("/editCheckAll", function (req,res,next) {
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId}, function (err,user) {
    if(err){
      res.json({
        status:'500',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function (err1,doc) {
            if(err1){
              res.json({
                status:'500',
                msg:err1,message,
                result:''
              });
            }else{
              res.json({
                status:'200',
                msg:'',
                result:'suc'
              });
            }
        })
      }
    }
  });
});
//查询用户地址接口
router.get("/addressList", function (req,res,next) {
  //var userId = req.cookies.userId;
  //测试
  console.log("yhcj");
  var userId=100000077;
  User.findOne({userId:userId}, function (err,doc) {  
    if(err){
      res.json({
        status:'500',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'200',
        msg:'',
        result:doc.addressList
      });
    }
  })
});
//设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  //addressId为空，那么直接返回
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else{
    //查找用户，并且取得地址列表
    User.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'500',
          msg:err.message,
          result:''
        });
      }else{
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId ==addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });
        //存入数据库
        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'500',
              msg:err.message,
              result:''
            });
          }else{
              res.json({
                status:'200',
                msg:'',
                result:''
              });
          }
        });
      }
    });
  }
});
//删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userId = req.cookies.userId,
  addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  }, function (err,doc) {
      if(err){
        res.json({
            status:'500',
            msg:err.message,
            result:''
        });
      }else{
        res.json({
          status:'200',
          msg:'',
          result:''
        });
      }
  });
});

//支付接口
router.post("/payMent", function (req,res,next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId,
    //应该把所有金额信息都传递过来，然后做订单记录
    orderTotal = req.body.orderTotal;
  User.findOne({userId:userId}, function (err,doc) {
     if(err){
        res.json({
            status:"500",
            msg:err.message,
            result:''
        });
     }else{
       var address = '',goodsList = [];
       //获取当前用户的地址信息
       doc.addressList.forEach((item)=>{
          if(addressId==item.addressId){
            address = item;
          }
       })
       //获取用户购物车的购买商品
       doc.cartList.filter((item)=>{
         if(item.checked=='1'){
           goodsList.push(item);
         }
       });
      
       //orderId生成方法
       var platform = '622';  //平台编号
       var r1 = Math.floor(Math.random()*10);
       var r2 = Math.floor(Math.random()*10);

       var sysDate = new Date().Format('yyyyMMddhhmmss');
       var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
       var orderId = platform+r1+sysDate+r2;
       //订单信息
       var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          //订单状态 1表示成功
          orderStatus:'1',
          //订单日期
          createDate:createDate
       };
      //存储订单
       doc.orderList.push(order);

       doc.save(function (err1,doc1) {
          if(err1){
            res.json({
              status:"500",
              msg:err.message,
              result:''
            });
          }else{
            res.json({
              status:"200",
              msg:'',
              result:{
                orderId:order.orderId,
                orderTotal:order.orderTotal
              }
            });
          }
       });
     }
  })
});

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId}, function (err,userInfo) {
      if(err){
          res.json({
             status:'500',
             msg:err.message,
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         if(orderList.length>0){
           var orderTotal = 0;
           orderList.forEach((item)=>{
              if(item.orderId == orderId){
                orderTotal = item.orderTotal;
              }
           });
           if(orderTotal>0){
             res.json({
               status:'200',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               }
             })
           }else{
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});
module.exports = router;
