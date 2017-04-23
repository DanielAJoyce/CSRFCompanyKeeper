var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var User = require("./models/user");
var Company = require("./models/company");
var middlewareAuth = require("./middleware/auth");
var bcrypt = require("bcrypt");
var app = express();

mongoose.connect("mongodb://localhost/companykeeper");

const saltRounds = 10;
app.set("view engine","ejs");

app.use(express.static(__dirname + "/public")); //to get static files like stylesheets
app.use(methodOverride("_method"));

// setup route middlewares 
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })



// create express app 

 
// parse cookies 
var secretCookie = "Iamasecretshhhh123912-039";
//Using a secret for a little bit of added protection. Will use along with CSRF
app.use(cookieParser(secretCookie));
app.get("/", function(req,res){
  res.render("index");
});
app.get('/register', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 
  res.render('register', { csrfToken: req.csrfToken() })
})
 
app.post('/register', parseForm, csrfProtection, function(req, res) {

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



app.get("*", function(req,res){
    res.send("notfound");
   // res.redirect("index");
});

app.listen(3001);
console.log("server on");
