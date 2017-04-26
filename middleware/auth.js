var User = require("../models/user");
var Company = require("../models/company");


authObj = {};


//Checks if there's a current user and if not, takes them to login page.
// authObj.requireLogin = function(req, res, next) {
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     next();
//   }
// };


authObj.isLoggedIn = function(req,res,next){
    //This'll check the person is logged in.
  if(req.session.user){
    return next(); // goes to the callback function that's next.
  }
  res.redirect("/login");
};

//Checks to see if it's the owner. If not, returns to index
authObj.isOwner = function(req,res,next){
if(req.session.user){
    Company.findById(req.params.id, function(err, foundCompany){
      if(err){
        console.log(err);
        console.log("Could not find Id");
        res.redirect("/");
      }else{
        //if(foundCompany.user.username.equals(req.session.user.username)){
          if(foundCompany.user.username == req.session.user.username){
          next();
        }
        else{
          console.log("User does not have permission");
          res.redirect("/");
        }
      }
    })
  }
};

module.exports = authObj;