var express = require("express");
var router = express.Router();
var User = require("../models/user");
var csrf = require("csurf");
var middlewareAuth = require("../middleware/auth");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

router.get("/", function(req,res){
console.log("Req.user:" + req.user);
  res.render("index", {session:req.session});
});

router.get('/register', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 
  res.render('register', { csrfToken: req.csrfToken() })
})
 
router.post('/register', parseForm, csrfProtection, function(req, res) {

  console.log(req.secret);

  if(req.secret == secretCookie){
    console.log("secret matches");

    var pass = req.body.password;
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(pass,salt);
    console.log("hash: " + hash);

    var user = new User({
      username:req.body.username,
      password:hash,
    });

    user.save(function(err){
      if(err){
        console.log("There's been a problem");
        console.log(err);
        res.redirect("register");
      }else
      {
        res.redirect("/");
      }
      
    });
  }else{
    console.log("secret was incorrect - redirecting to index");
    res.redirect("/");
  }
    //res.send('data is being processed')
});

router.get('/login', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 

  res.render('login', { csrfToken: req.csrfToken() })
});

router.post('/login', parseForm, csrfProtection, function(req, res) {
    console.log("got to login")
  User.findOne({username:req.body.username},function(err, user){
    if(!user){
      console.log("no user of this login");
      res.render("login", {csrfToken:req.csrfToken()});
    }else{
      if(bcrypt.compareSync(req.body.password, user.password)){
        console.log("This is the user: " + user);
        console.log("credentials correct, logging in");
        createUserSession(req,res,user);
        res.redirect("/company");
        //console.log(req);
      }
      else{
        console.log("incorrect password");
        res.redirect("login");
      }
      }
  });
});

router.get("/logout", function(req,res){
  req.session.reset();
  res.redirect("/");
});

// router.get("*", function(req,res){
//     res.send("notfound");
//    // res.redirect("index");
// });
module.exports = router;
