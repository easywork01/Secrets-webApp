require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(
    session({
      secret: "our little secret.",
      resave: false,
      saveUninitialized: false,
    })
  ); //setting up session for Login/Signup
  
app.use(passport.initialize());//initilaise passport.js
app.use(passport.session());//using passport for dealing with the session

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});//userSchema is based on mongoose JsObject which has two fields

userSchema.plugin(passportLocalMongoose);//using passport for hash and salt password and store users in mong_DB

const User = new mongoose.model("User", userSchema);
//making a new model using userSchema name of model is "User"(singluar form)
//next we make a new collection called "Users"(plural) to store each entry of our model

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());//creating cookie and storing user data
passport.deserializeUser(User.deserializeUser());//breaking cookie and deccodeing user data

app.get("/",function(req,res){
    res.render("home");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});


//logout funtion
// app.get("/logout", function(req, res){
//     req.logout();
//     res.redirect("/");
// });

app.post("/register", function(req, res) {

    User.register({ username: req.body.username }, req.body.password, function (
        err,
        user
      ) {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
        }
      });











  //bcryprt code(old)
    // bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
    //   try {
    //     if (err) {
    //       console.log(err);
    //       return res.status(500).send("Error occurred while hashing the password.");
    //     }
  
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //       email: req.body.username,
    //       password: hash
    //     });
  
    //     await newUser.save();
    //     res.render("dash");
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).send("Error occurred while saving the user.");
    //   }
    // });
  });
  




app.post("/login", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res , function(){
                res.redirect("/secrets");
            });
        }
    })












    // bcrypt code(old)
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email : username}, function(err, foundUser){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(foundUser){
    //             // Load hash from your password DB.
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                 // result == true
    //                 if(result === true){
    //                     res.render("dash");
    //                 }
    //             });
                    
                
    //         };
    //     }
    // });
});





app.listen(3000, function(){
    console.log("server has launched on port 3000");
});