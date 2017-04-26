//Inclusion of libraries
var cookieParser = require('cookie-parser'),
  csrf = require('csurf'),
  bodyParser = require('body-parser'),
  express = require('express'),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  User = require("./models/user"),
  Company = require("./models/company"),
  middlewareAuth = require("./middleware/auth"),
  bcrypt = require("bcrypt"), // Encryption for user passwords
  session = require("client-sessions"),
  app = express();



//==========Routes files========
var companyRoutes = require("./routes/company");
var indexRoutes = require("./routes/index");

//database connection string 
mongoose.connect("mongodb://localhost/companykeeper");

//
const saltRounds = 10;

//View engine is EJS. Has Ruby-esque syntax on view pages.
app.set("view engine","ejs");

app.use(express.static(__dirname + "/public")); //to get static files like stylesheets
app.use(methodOverride("_method")); // This is for use on Edit and Deletes for overriding POST method.

//Creates user session
  app.use(session({
    cookieName: 'session',
    secret: 'Iamasecretshhhh123912-039',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }));


//CsrfProtection is the Cross Site reference library used to stop CSR attacks.
//Creates random token which then expects it. You can see this by going into a view
// It'll show a hidden input which will be the CSRf generated token
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })


var secretCookie = "Iamasecretshhhh123912-039";
// create express app 


//New User session
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


//Starts up server on port 3001
app.listen(3001);
console.log("server on");
