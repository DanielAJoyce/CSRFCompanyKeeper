var express = require("express"),
  router = express.Router(),
  User = require("../models/user"),
  csrf = require("csurf"),
  middlewareAuth = require("../middleware/auth"),
  bodyParser = require("body-parser"),
  bcrypt = require("bcrypt"),
  csrfProtection = csrf({ cookie: true }),
  parseForm = bodyParser.urlencoded({ extended: false });

var secretCookie = "Iamasecretshhhh123912-039";
const saltRounds = 10;
//Index Get route
router.get("/", function(req,res){
  res.render("index", {session:req.session});
});

//gets the register page(NEW route)
router.get('/register', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 
  res.render('register', { csrfToken: req.csrfToken() })
});
 
router.post('/register', parseForm, csrfProtection, function(req, res) {
  if(req.secret == secretCookie){
    console.log("secret matches");

    //generating and storing hash
    var pass = req.body.password;
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(pass,salt);

    //creation of user object 
    var user = new User({
      username:req.body.username,
      password:hash,
    });
    //stores user in database.
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


/*
/ Grabs the user from the database with that username
/ Checks password using bcrypt's compare with the hash
/ Creates user session and re-directs to company page with successful login
*/
router.post('/login', parseForm, csrfProtection, function(req, res) {
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


//Just resets session data.
router.get("/logout", function(req,res){
  req.session.reset();
  res.redirect("/");
});

//Will expose this file to the global scale
module.exports = router;
