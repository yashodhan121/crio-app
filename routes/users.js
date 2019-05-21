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
      password:password
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
      successRedirect:'/crio/layout',
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
  res.render('profile');
});

router.post('/fileupload', function(req, res){
  var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
console.log(oldpath);
var newpath = path.join(__dirname,'../public/img/') + req.user.username+'.png';
fs.readFile(oldpath, function (err, data) {
if (err) throw err;
console.log('File read!');

// Write the file
fs.writeFile(newpath, data, function (err) {
if (err) throw err;
res.redirect('/users/myprofile')
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
  console.log("/img/"+ req.user.username+".png");
  res.render('myprofile',{
    user: req.user,
    username: "/img/"+ req.user.username+".png"
  });
});

module.exports = router;
