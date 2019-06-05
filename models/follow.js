const mongoose = require('mongoose');

//user Schema
const FollowSchema = mongoose.Schema({
  nusername:{
    type: String
  },
  username:{
    type: String
  },
  follow:{
    type: String
  }, 
  request:{
    type: String
  }
  
});

const Follow = module.exports = mongoose.model('follow', FollowSchema);
