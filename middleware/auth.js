

authObj = {};

authObj.requireLogin = function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

authObj.isLoggedIn = function(req,res,next){
    //This'll check the person is logged in.
  if(req.session.user){
    return next(); // goes to the callback function that's next.
  }
  res.redirect("/login");
};


module.exports = authObj;