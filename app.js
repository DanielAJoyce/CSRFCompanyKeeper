var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require("mongoose");
// var ObjectId = require("mongodb").ObjectId;
// var ObjId = require("mongoose").Types.ObjectId;
var methodOverride = require("method-override");
var User = require("./models/user");
var Company = require("./models/company");
var middlewareAuth = require("./middleware/auth");
var bcrypt = require("bcrypt");
var session = require("client-sessions");
var app = express();

var companyRoutes = require("./routes/company");
var indexRoutes = require("./routes/index");


mongoose.connect("mongodb://localhost/companykeeper");

const saltRounds = 10;
app.set("view engine","ejs");

app.use(express.static(__dirname + "/public")); //to get static files like stylesheets
app.use(methodOverride("_method"));

  app.use(session({
    cookieName: 'session',
    secret: 'Iamasecretshhhh123912-039',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }));

// setup route middlewares 
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })
var secretCookie = "Iamasecretshhhh123912-039";
// create express app 
// parse cookies 

createUserSession = function(req, res, user) {
  var cleanUser = {
    username:  user.username,
    id: user._id,
  };

  req.session.user = cleanUser;
  req.user = cleanUser;
  res.locals.user = cleanUser;
  console.log("User session:" +  req.session.user.username);
};

//Using a secret for a little bit of added protection. Will use along with CSRF
app.use(cookieParser(secretCookie));
app.use("/", indexRoutes);
app.use("/company", companyRoutes);

app.listen(3001);
console.log("server on");
