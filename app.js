//jshint esversion:6

//                                                 mongoose                 //
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userdb")

const userschema=new mongoose.Schema({
email:String,
password:String
});

const secretschema=new mongoose.Schema({
inputsecret:String
});

const user=mongoose.model("user",userschema);
const secret=mongoose.model("secret",secretschema);
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
const newuser=new user({
    email:req.body.email,
    password:req.body.password
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
user.find({email:req.body.email,password:req.body.password},function(err,x){
if(err)
console.log(err);
else
{
if(x.length!=0)
{
    console.log(x);
res.render("secrets");
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
const newsecret=new secret({
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