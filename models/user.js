var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var passLocalMongoose=require('passport-local-mongoose');
var User=new Schema({
    admin:{
        type:Boolean,
        default:false
    }
});
User.plugin(passLocalMongoose);
module.exports=mongoose.model('User',User);