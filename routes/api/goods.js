var express = require('express');
var router = express.Router();

// 引入模型
var Goods = require('./../../models/goods');
var User = require('./../../models/user');
router.get('/', function(req, res, next) {
    console.log("welcome to GoodsList");
    // Goods.find({},(err,docs)=>{
    //     if(err){
    //         console.log('err',err);
    //         return;
    //     }
    //     console.log(docs);
    // });
});

/* 二级路由 子路由*/ 
//查询商品列表数据(获取数据)
router.get('/list', function(req, res, next) {
    //res.send('respond with a resource goods');
    /** 
     * 前端传递
     * page 当前页数
     * pageSize 每页多少条数据
     * sort  1表示生序 -1表示降序
     * priceLevel 价格的区间范围
     * 根据数据计算
     * skip = （page-1）* pageSize 需要过滤几条数据
     * priceGt 最低价格
     * priceLte 最高价格
     */
    // 分页实现使用了Mongodb的query.skip().limit().where() 这三个方法，
    // 然后利用query.exec()。
    let page = parseInt(req.param("page"));
    let pageSize = parseInt(req.param("pageSize"));
    let priceLevel = req.param("priceLevel");
    let sort = req.param("sort");
    let skip = (page-1)*pageSize;
    var priceGt = '',priceLte = '';
    let params = {};
    if(priceLevel!='all'){
      switch (priceLevel){
        case '0':priceGt = 0;priceLte=100;break;
        case '1':priceGt = 100;priceLte=500;break;
        case '2':priceGt = 500;priceLte=1000;break;
        case '3':priceGt = 1000;priceLte=5000;break;
      }
      params = {
        salePrice:{
            $gt:priceGt,
            $lte:priceLte
        }
      }
    }
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort});
    goodsModel.exec(function (err,doc) {
        if(err){
            res.json({
              status:'500',
              msg:err.message
            });
        }else{
            res.json({
                status:'200',
                msg:'',
                result:{
                    count:doc.length,
                    list:doc
                }
            });
            console.log(doc);
        }
    })

});

//加入到购物车
router.post("/addCart", function (req,res,next) {
    //使用商品id来向用户中插入商品
    var userId = req.cookies.userId,productId = req.body.productId;
    //获取特定用户
    User.findOne({userId:userId}, function (err,userDoc){
        if(err){
            res.json({
                status:"500",
                msg:"该用户不存在"
            })
        }else{
            //console.log("userDoc:"+userDoc);
            //特定用户
            if(userDoc){
                //如果之前购物车中就是有这个商品的，那么只要把这个商品的数量++
                //而不是新增加一条数据
                //userDoc.cartList 用户的购物车
                var goodsItem = '';
                userDoc.cartList.forEach(function (item) {
                    //遍历购物车的时候，商品id和传递过来的商品id一致
                    //说明之前购物车中就存在这个商品
                    if(item.productId == productId){
                        //保存该条商品信息，添加商品数量
                        goodsItem = item;
                        item.productNum ++;
                    }
                });
                //goodsItem==true的时候，表示之前就存在这个商品
                if(goodsItem){
                    //那么就把userDao更新（商品数量增加）
                    userDoc.save(function (err2,doc2) {
                        if(err2){
                            res.json({
                                status:"500",
                                msg:"存在的商品数量未增加"
                            })
                        }else{
                            res.json({
                                status:'200',
                                msg:'存在的商品数量增加',
                                result:'success'
                            })
                        }
                    })
                }else{
                    //是从后端来判断商品是否存在的
                    Goods.findOne({productId:productId}, function (err1,doc) {
                        //传过来的商品id有错误
                        if(err1){
                            res.json({
                                status:"500",
                                msg:"传过来的商品id有错误"
                            })
                        }else{
                            if(doc){
                                //加入购物车的数量是1，默认被选中
                                doc.productNum = 1;
                                doc.checked = 1;
                                //向查出来的特定用户的购物车list中插入doc对象
                                //save一下就可以把内容储存进去了
                                userDoc.cartList.push(doc);
                                userDoc.save(function (err2,doc2) {
                                    if(err2){
                                        res.json({
                                            status:"500",
                                            msg:"新添商品未添加成功"
                                        })
                                    }else{
                                        res.json({
                                            status:'200',
                                            msg:'新添商品添加成功',
                                            result:'success'
                                        })
                                    }
                                })
                            }
                        }
                    });
                }
            }   
        }
    })
  });

module.exports = router;