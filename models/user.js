const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true,'Name field is reqired']
  },
  password:{
    type: String,
    reqired: [true, 'password field is reqired']
  },
  is_online:{
    type:Boolean,
    default:false
  },
  last_login:{
    type:String,
    default:'today'
  },
  room_id:[Schema.ObjectId]
});

const User= mongoose.model('user',UserSchema);

module.exports = User;

//for creating user (also To hash a password)
module.exports.createUser = function(newUser,callback){
  bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(newUser.password,salt,function(err,hash){
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

//To check a password:
module.exports.comparePassword = function(candidatePassword,hash,callback){
  bcrypt.compare(candidatePassword,hash,function(err,isMatch){
    if(err) throw err;
    callback(null,isMatch);
  });
}