//libraries
const express = require('express');
const router = express.Router();
//Bring in models
let user = require('.././models/user');
const imgsr= "";

//routes
router.get('/layout', function(req, res){
	res.render('layout');
});


//export router
module.exports = router;
