//jshint esversion:6


require('dotenv').config();

// var md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 2;

//                                                 mongoose                 //
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);

const express=require("express");
const bodyParser = require("body-parser");
const ejs=require("express");
const { allowedNodeEnvironmentFlags } = require("process");

// var encrypt = require('mongoose-encryption');
var session =require("express-session");
var passport=require("passport");
var passportLocalMongoose=require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate=require("mongoose-findorcreate");

const app = express();

app.use(session({
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userdb")



const userschema=new mongoose.Schema({
username:String,
password:String,
googleId:String
});           

userschema.plugin(passportLocalMongoose);
userschema.plugin(findOrCreate);
const secretschema=new mongoose.Schema({
inputsecret:String
});

//                                  encryption                                           //


// userschema.plugin(encrypt, { secret: process.env.SECRET  ,excludeFromEncryption: ['email'],}); 


//                                  encryption                                           //

const User=mongoose.model("User",userschema);
const secrets=mongoose.model("secrets",secretschema);



//                                                 mongoose                 //
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





app.get("/",function(req,res){
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secret');
  });

app.get("/login",function(req,res){
res.render("login");
});



app.get("/register",function(req,res){
    res.render("register");
    });
    
app.get("/secret",function(req,res){
if(req.isAuthenticated()){
    secrets.find({},function(err,x){
        if(!err)
        {
            res.render("secrets",{secretdata:x});  
        }
    });

}
    else
    {
        console.log("u were in secret");
    res.redirect("/login");
    }
});

app.post("/register",function(req,res){
   
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
        console.log(err);
    res.redirect("/register");
        }
        else
        {
            console.log("imher");
            passport.authenticate('local',{ successRedirect: '/secret', failureRedirect: '/login' })(req, res);
            }
        });
    });



// passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', })(req, res);

app.post("/login",function(req,res){
const user=new User({
    username:req.body.username,
    password: req.body.password
});
req.login(user,function(err){
    if(err)
    console.log(err);
    else
    {
        console.log("imher");
        passport.authenticate('local',{ successRedirect: '/secret', failureRedirect: '/login' })(req, res);

    }
})
});




app.get("/logout",function(req,res){
    req.logout(function(err){
        if(!err)
        res.redirect("/");
        else
        console.log(err);
    });

});

app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
      
            
                res.render("submit");
            
        }
    else
    res.redirect("/login");
    

    });
    

app.post("/submit",function(req,res){
const newsecret=new secrets({
inputsecret: req.body.secret
});
newsecret.save(function(err){
    if(err)
    console.log(err);
    else
    {
    secrets.find({},function(err,x){
        if(!err)
        {
            res.render("secrets",{secretdata:x});  
        }
    });}
});


});


const port =process.env.PORT || 3000;
app.listen(port,function(){
console.log("server running on "+ port);
});
