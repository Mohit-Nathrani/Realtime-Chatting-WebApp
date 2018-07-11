const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  user1: {
    type: Schema.ObjectId,
    required: [true,'require two users']
  },
  user2:{
    type: Schema.ObjectId,
    required: [true,'require two users']
  },
  user1_name:{
    type: String,
    require: [true,'require user name']
  },
  user2_name:{
    type: String,
    require: [true,'require user name'] 
  },
  messages:{
    type:[Schema.ObjectId]
  },
  lastmsg:{
    type:String,
    default: ''
  },
  last_change:{
    type: Date,
    default: Date.now
  },
  not_readed_msg:{
    type: [Schema.ObjectId]
  },
  not_readed_by:{
    type: Schema.ObjectId
  }
});

  
const Room = mongoose.model('room',RoomSchema);
module.exports = Room