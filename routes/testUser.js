var express = require('express');
var router = express.Router();

var User = require('./../models/testUser');// 引入模型

router.get('/',function(req,res,next){
    console.log("welcome to testUser");
});
router.get('/submin',(req,res,next)=>{

    //console.log("user"+ User);
    User.find({},(err,docs)=>{
        if(err){
            console.log('err',err);
            return;
        }
        console.log(docs);
    });
});

module.exports = router;
