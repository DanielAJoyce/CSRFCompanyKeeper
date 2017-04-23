var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
var express = require('express')
var methodOverride = require("method-override");
var app = express()


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
    


  }else{
    console.log("secret was incorrect - redirecting to index");
    res.redirect("index");
  }

    res.send('data is being processed')
});



app.get("*", function(req,res){
    res.send("notfound");
   // res.redirect("index");
});

app.listen(3001);
console.log("server on");
