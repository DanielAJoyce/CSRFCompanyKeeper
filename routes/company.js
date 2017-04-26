var express = require("express"),
  router = express.Router(),
  User = require("../models/user"),
  Company = require("../models/company"),
  csrf = require("csurf"),
  middlewareAuth = require("../middleware/auth"),
  bodyParser = require("body-parser"),
  bcrypt = require("bcrypt");

//CsrfProtection is the Cross Site reference library used to stop CSR attacks.
//Creates random token which then expects it. You can see this by going into a view
// It'll show a hidden input which will be the CSRf generated token
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })



//Index for company page.
router.get("/", middlewareAuth.isLoggedIn, function(req,res){
  console.log("User: " + req.session.user.username);

    Company.find().where('user.id').equals(req.session.user.id).exec(function(err, companies){
    if(err){
      console.log(err);
    }else
    {
      console.log("grabbed companies: "+ companies);
      res.render("company/index", {companies:companies});
    }
   });
});

//New Company POST route
router.post("/", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
    console.log("user id: " + req.session.user.id);

    //Create new Company object to save to database.
    var company = new Company({
      name: req.body.name,
      address: req.body.address,
      phonenumber:req.body.phonenumber,
      user:{
        id:req.session.user.id,
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
});

//New Company GET route
router.get("/new", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
  res.render("company/new", {csrfToken:req.csrfToken()});
});

//Shows Edit page.
router.get("/:id/edit", middlewareAuth.isLoggedIn, middlewareAuth.isOwner, parseForm,csrfProtection, function(req,res){
  Company.findOne().where('_id').equals(req.params.id).exec(function(err, company){
    if(err){
      console.log(err);
    }else{
      // console.log("company data: " + company);
      // console.log("company name: " + company.name);
      res.render("company/edit", {company:company, csrfToken:req.csrfToken()});
    }
  });
});

router.put("/:id", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){

  var dataToInsert = {
    name: req.body.name,
    phonenumber: req.body.phonenumber,
    address:req.body.address,
  };

  // console.log(req.body.name);
  // console.log(req.body.phonenumber);
  // console.log(req.body.address);

  Company.findByIdAndUpdate(req.params.id, dataToInsert, function(err,updatedCompany){
    if(err){
       console.log("Something went wrong");
      res.redirect("/company/"+req.params.id+"/edit");
      
    }else{
      console.log("company edited");
     res.redirect("/company");
    }
  });

});


//Delete route for companies
router.delete("/:id", middlewareAuth.isLoggedIn, middlewareAuth.isOwner, function(req,res){
  Company.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log("Couldn't delete company");
      res.redirect("/company");
    }else{
      console.log("Company deleted!");
      res.redirect("/company");
    }
  })
});


//Will expose this file to the global scale
module.exports = router;
