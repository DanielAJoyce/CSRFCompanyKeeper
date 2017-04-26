var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Company = require("../models/company");
var csrf = require("csurf");
var middlewareAuth = require("../middleware/auth");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

router.get("/", middlewareAuth.isLoggedIn, function(req,res){
  console.log("User: " + req.session.user.username);

  //Company.find({user:{id:o_id}, user:{username:req.session.user.username}}, function(err, companies){
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


router.post("/", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
    console.log("user id: " + req.session.user.id);

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
    //res.send("hit post route");
});

router.get("/new", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
  res.render("company/new", {csrfToken:req.csrfToken()});
});

router.get("/:id/edit", middlewareAuth.isLoggedIn, middlewareAuth.isOwner, parseForm,csrfProtection, function(req,res){
  console.log("req user creds:" + req.session.user._id + " " + req.session.user._id);
 console.log("id of Company: " + req.params.id);
//  var compObjId = new ObjId(req.params.id);

Company.findOne().where('_id').equals(req.params.id).exec(function(err, company){
  // Company.findOne({_id:compObjId}, function(err,company){
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

router.put("/:id", middlewareAuth.isLoggedIn, parseForm, csrfProtection, function(req,res){
  //console.log("req.body.company.name: " + req.body.company);
  //console.log("req.body.company: " + req.body.company);
  //console.log("req.params.id: " + req.params.id);

  var dataToInsert = {
    name: req.body.name,
    phonenumber: req.body.phonenumber,
    address:req.body.address,
  };
  console.log(req.body.name);
  console.log(req.body.phonenumber);
  console.log(req.body.address);

  Company.findByIdAndUpdate(req.params.id, dataToInsert, function(err,updatedCompany){
    if(err){
       console.log("Something went wrong");
      res.redirect("/company/"+req.params.id+"/edit");
      
    }else{
      console.log("company edited");
     res.redirect("/company");
    }
  });

  //res.send("You hit the PUT route");
});

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
 // res.send("You hit the delete route");
});

module.exports = router;
