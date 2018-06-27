var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var testUserSchema = new Schema({
    username:String,
    password:String
});
module.exports = testUserSchema;