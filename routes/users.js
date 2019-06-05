const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var formidable = require('formidable');
var fs = require('fs');
const path = require('path');
var lt;

//set public folder
router.use(express.static(path.join(__dirname,'public')));

//Bring in models
let User = require('../models/user');
let Follow = require('../models/follow');

//Register form
router.get('/register', function(req,res){
  res.render('register');
});


//register process
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Name is not valid').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  }
  else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      profileimg:"/img/"+username+".png"
    });
    var lt = newUser;
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function(err){
        if(err){
          req.flash('danger','user exists');
          res.render('register',{
            errors:errors
          });
          return;
        }
        else {
          req.flash('success', 'You are now registered and can log in');
          res.redirect('/users/login');
        }
      });
    });
  });
  }
});

//login form
router.get('/login', function(req,res){
  res.render('login');
});

//login process
router.post('/login', function(req, res, next){
    passport.authenticate('local',{
      successRedirect:'/users/myprofile',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
})

router.get('/fileupload', function(req, res){
  res.render('profileimg',{
    username: "/img/"+ req.user.username+".png"
  });
});

router.post('/fileupload', function(req, res){
  var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
//console.log(oldpath);
var newpath = path.join(__dirname,'../public/img/') + req.user.username+'.png';
fs.readFile(oldpath, function (err, data) {
if (err) throw err;
console.log('File read!');

// Write the file
fs.writeFile(newpath, data, function (err) {
if (err) throw err;
res.redirect('/users/fileupload')
res.end();
console.log('File written!');
});

// Delete the file
fs.unlink(oldpath, function (err) {
if (err) throw err;
console.log('File deleted!');
});
    });
}); 
});

router.get('/myprofile', function(req, res){
  res.render('myprofile',{
    user: req.user,
    username: req.user.profileimg
  });
});

router.get('/edit',function(req,res){
  res.render('editprofilepic',{
    username: req.user.profileimg
  });
});

router.get('/find', (req, res)=>{
  User.find({}, function(err, users){
    if(err){
      res.redirect('/user/login');
    }
    else{
      res.render('findpeople',{
        users: users,
        user : req.user.username
      });
    }
  });
});


//followprocess
var fol = "Follow";
router.get('/profile/:id', function(req, res){
  User.findById(req.params.id, function(err, users){
    Follow.findOne({username : req.user.username , nusername: users.username}, function(err, follows){
        console.log(follows);
        try{
          if(follows.request = "1")
          {
           fol = "Requested";
          }
          if(follows.request = "0")
          {
            if(follows.follow = "1")
            {
              fol = "Following";
            }
          }
          else if(follows.follow = "0")
          {
            fol = "Follow";
          }
        }
        catch{
            res.render('profile', {
          fol: fol,
          user: users
        });
        }
        res.render('profile', {
        fol: fol,
        user: users
      });
    });
  });
});
router.post('/profile/:id', function(req, res){
  User.findById(req.params.id, function(err, users){
      const nusername= users.username;
      const username = req.user.username;
      const request = "1";
      const follow = "0";

      newFollow = new Follow({
        nusername : nusername,
        username : username,
        request : request,
        follow : follow
      });
      newFollow.save();
    });
});

router.get('/notify', function(req, res){
  User.find(function(err, user){

      Follow.find({nusername: req.user.username,request: 1},function(err, notify){
      if(err)
      {
        console.log(err);
      }
      res.render('notifications',{
        notify: notify,
        user:user
      });
    });
  });
});

router.post('/profile/:id/acc', function(req, res){
    let follow = {};
    follow.follow = 1;
    follow.request = 0;
    Follow.updateOne({_id: req.params.id} , follow , function(err){
      if(err){
        console.log(err);
        return;
      }
      else
      {
        res.redirect('/users/notify');
      }
    });
  });
router.post('/profile/:id/rej', function(req, res){
    Follow.deleteOne({_id: req.params.id}, function(err){
      if(err){
        console.log(err);
        return;
      }
      else
      {
        res.redirect('/users/notify');
      }
    });
  });

  router.get('/followers', function(req, res){
    User.find({}, function(err, users){
      Follow.find({nusername: req.user.username, follow: 1}, function(err, follow){
        res.render('followers',{
          users: users,
          follow: follow
        })
      });
    });
  });


  router.get('/following', function(req, res){
    User.find({}, function(err, users){
      Follow.find({username: req.user.username, follow: 1}, function(err, follow){
        res.render('following',{
          users: users,
          follow: follow,
          user1: req.user.username
        })
      });
    });
  });
module.exports = router;