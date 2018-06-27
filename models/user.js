var mongoose = require('mongoose');
var userSchema = require('../schemas/userSchema');

//创建model，这个地方的good对应mongodb数据库中goods的conllection。
//mongoose会自动改成复数，如模型名：xx―>xxes, kitten―>kittens, money还是money
var user = mongoose.model('user',userSchema);
module.exports = user;