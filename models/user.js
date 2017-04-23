var mongoose=require("mongoose");


var UserSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    username:{ type: String, unique: true},
    password:String,
});

module.exports=mongoose.model("User",UserSchema);