var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
var ObjId = require("mongoose").Types.ObjectId;
var methodOverride = require("method-override");
var User = require("./models/user");
var Company = require("./models/company");
var middlewareAuth = require("./middleware/auth");
var bcrypt = require("bcrypt");
var session = require("client-sessions");
var app = express();

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
app.get("/", function(req,res){
console.log("Req.user:" + req.user);
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

app.get('/login', csrfProtection, function(req, res) {
  // pass the csrfToken to the view 

  res.render('login', { csrfToken: req.csrfToken() })
});

app.post('/login', parseForm, csrfProtection, function(req, res) {
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

app.get("/company", middlewareAuth.isLoggedIn, function(req,res){
  var id = req.session.user.id;
  var o_id = new ObjectId(id);
  console.log("o_id: " + o_id);

  console.log("User: " + req.session.user.username);
  Company.find({user:{id:o_id}, user:{username:req.session.user.username}}, function(err, companies){
    //Company.find({user:{id:o_id}, user:{username:req.session.user.username}}, function(err, companies){
    //Company.find({user:{username:req.session.user.username}}, function(err, companies){
      //}, {user:{username:req.session.user.username}
    if(err){
      console.log(err);
    }else
    {
      console.log("grabbed companies: "+ companies);
      // if(companies.undefined){
      //   console.log("yes");
      //   companies = "";
      // }
      res.render("company/index", {companies:companies});
    }
   });
});


app.post("/company", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
    console.log("user id: " + req.session.user.id);

    var company = new Company({
      name: req.body.name,
      address: req.body.address,
      phonenumber:req.body.phonenumber,
      user:{
        //id:req.session.user.id,
        username:req.session.user.username,
      }
    });
    company.save(function(err){
      if(err){
        console.log(err);
        res.redirect("/company/new");
      }else{
        console.log("Company entry created for user");

        res.redirect("/company");
      }
    })

    console.log(req.session.username);
    //res.send("hit post route");
});

app.get("/company/new", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
  res.render("company/new", {csrfToken:req.csrfToken()});
});

app.get("/company/:id/edit", middlewareAuth.isLoggedIn, parseForm,csrfProtection, function(req,res){
  console.log("req user creds:" + req.session.user._id + " " + req.session.user._id);
 console.log("id of Company: " + req.params.id);
 var compObjId = new ObjId(req.params.id);

  Company.findOne({_id:compObjId}, function(err,company){
    //Company.find({_id:"Objectid"(req.params.id)}, function(err,company){
    if(err){
      console.log(err);
    }else{
      console.log("company data: " + company);
      console.log("company name: " + company.name);
      res.render("company/edit", {company:company, csrfToken:req.csrfToken()});
    }
  });


  //res.send("You hit the PUT route");
  //Company.find({user:{username:req.session.user.username}}, function(err, companies){


  //res.render("/company/edit", {csrfToken:req.csrfToken()});
});

app.get("/company/:id/delete", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
  res.send("You hit the route");
})

app.get("/logout", function(req,res){
  req.session.reset();
  res.redirect("/");
});

app.get("*", function(req,res){
    res.send("notfound");
   // res.redirect("index");
});

app.listen(3001);
console.log("server on");
