//jshint esversion:6
require('dotenv').config();

// var md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 2;

//                                                 mongoose                 //
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userdb")
// var encrypt = require('mongoose-encryption');


const userschema=new mongoose.Schema({
email:String,
password:String
});           



const secretschema=new mongoose.Schema({
inputsecret:String
});

//                                  encryption                                           //


// userschema.plugin(encrypt, { secret: process.env.SECRET  ,excludeFromEncryption: ['email'],}); 


//                                  encryption                                           //





const user=mongoose.model("user",userschema);
const secrets=mongoose.model("secrets",secretschema);
//                                                 mongoose                 //

const express=require("express");
const bodyParser = require("body-parser");
const ejs=require("express");
const { allowedNodeEnvironmentFlags } = require("process");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
res.render("login");
});



app.get("/register",function(req,res){
    res.render("register");
    });
    


app.post("/register",function(req,res){
    const hash = bcrypt.hashSync(req.body.password, saltRounds);

const newuser=new user({
    email:req.body.email,
    password:hash
});
newuser.save(function(err){
    if(!err)
    {
    console.log("succesfully added user");
    res.render("secrets");
    }
    else
    console.log(err);
    });
    


});



app.post("/login",function(req,res){
user.findOne({email:req.body.email},function(err,x){
if(err)
console.log(err);
else
{
if(x.length!=0)
{
    const password=req.body.password;
   const result= bcrypt.compareSync(password, x.password);
        if(result === true)
        {
            res.render("secrets");
        }
        else
        {
            console.log(result);
            res.redirect("/login");
        }
   

}
else
res.redirect("/login");
}
});
});




app.get("/logout",function(req,res){
res.redirect("/");
});

app.get("/submit",function(req,res){
    res.render("submit");
    });
    

app.post("/submit",function(req,res){
const newsecret=new secrets({
inputsecret: req.body.secret
});
newsecret.save(function(err){
    if(err)
    console.log(err);
    else
    res.render("secrets");
});


});


const port =process.env.PORT || 3000;
app.listen(port,function(){
console.log("server running on "+ port);
});
