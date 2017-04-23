var mongoose=require("mongoose");

var CompanySchema = mongoose.Schema({
    name:String,
    address:String,
    phonenumber:String,
    user:{
        id:{
            //This'll allow for a relationship to be made to the database.
            //Many companies can have the same user, which can then be called for the
            //Company Show route.
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
         username:String
    },
   
});

module.exports=mongoose.model("Company",CompanySchema);