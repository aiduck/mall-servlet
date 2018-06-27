const mongoose = require('mongoose');
const config = require('./config');

module.exports =()=>{
    console.log(config.mongodb);
    //连接MongoDB数据库
    mongoose.connect(config.mongodb);
    //实例化对象
    var db = mongoose.connection;

    mongoose.connection.on("connected", function () {
        console.log("MongoDB connected success.")
    });
    
    mongoose.connection.on("error", function () {
        console.log("MongoDB connected fail.")
    });

    mongoose.connection.on("disconnected", function () {
        console.log("MongoDB connected disconnected.")
    });
    return db;
}