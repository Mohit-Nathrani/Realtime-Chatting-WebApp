const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: {
    type: Schema.ObjectId,
    required: [true,'from field is reqired']
  },
  to:{
    type: Schema.ObjectId,
    required: [true,'to field is reqired']
  },
  msg:{
    type: String,
    required : [true,'Empty Message Not Allowed']
  },
  read: {
    type:Boolean,
    default: false
  }
});

const Message= mongoose.model('message',MessageSchema);
module.exports = Message;
