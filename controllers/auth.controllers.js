const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("../config/passport");
const validator = require('validator')

// const datafile = require('../data.json')
const fs = require('fs');
const { error } = require("console");

const users = []; 
let usersdata = []
if (fs.existsSync('./data.json')) {
  const rawData = fs.readFileSync('./data.json');
  usersdata = JSON.parse(rawData);
  console.log("check data", usersdata)
}// store the user info here
initializePassport(
  passport,
  email => usersdata.find(user => user.email === email),
  id => usersdata.find(user => user.id === id)
  );

const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};

const postLogin = (req, res, next) => {

  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};

const postRegister = async (req, res, next) => {
  try {
    
    let data = [];
    if (fs.existsSync('./data.json')) {
      const rawData = fs.readFileSync('./data.json');
      data = JSON.parse(rawData);
      console.log("check data", data)
    }
    if (!validator.isStrongPassword(req.body.password)) {
      return res.status(400).send('Password not strong enough');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // req.body.password ==> password should be exact match to register.html name=password,  10:how many time you want to generate hash. it's a standard default value
    newuser={
      id: Date.now().toString(),
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    };

    data.push(newuser)

    // users.push({
    //   id: Date.now().toString(),
    //   name: req.body.username,
    //   email: req.body.email,
    //   password: hashedPassword,
    // });
    

    fs.writeFileSync("./data.json", JSON.stringify(data), err => {
     
      // Checking for errors
      if (err) throw err; 
     
      console.log("Done writing"); // Success
  });

    res.redirect("/login");
  } catch {
    console.error(error);
    res.status(500).send('An error occurred')
  }
  // console.log(datafile); // show the user list
};
module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
};
