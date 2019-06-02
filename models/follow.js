const mongoose = require('mongoose');

//user Schema
const FollowSchema = mongoose.Schema({
  nusername:{
    type: String,
    required: true,
  },
  name:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true,
    unique:true
  },
  profileimg:{
    type: String,
    required: true
  },
  follow:{
    type: Number
  },
  request:{
    type: Number
  }
});

const Follow = module.exports = mongoose.model('follow', FollowSchema);
