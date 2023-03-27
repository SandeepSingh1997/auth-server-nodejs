require("dotenv").config();
const express = require("express");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Connect to the configured Mongoose db
require("./config/database.js").connect();

const User = require("./model/user.js");
const tokenVerification = require("./middleware/auth.js");

const app = express();

app.use(express.json());

//Utility Functions (need to be moved to their own folder)
const isNameValid = (name) => {
  if (name && name.length < 30) {
    return true;
  } else {
    return false;
  }
};

const isEmailValid = (email) => {
  const validAtTheRate = /^[^@]+@?[^@]*$/;
  if (email && email.length < 40 && email.search(validAtTheRate) !== -1) {
    return true;
  } else {
    console.log("email  error");
    return false;
  }
};

const isPasswordValid = (password) => {
  const atLeastOnedigit = /\d+?/;
  const atLeastOneCapCase = /[A-Z]+?/;
  const atLeastOneSmallCase = /[a-z]+?/;
  const atLeastOneSpecialChar = /[!@#$%^&*)(+=._-]+?/;
  if (
    password &&
    password.length > 8 &&
    password.search(atLeastOnedigit) !== -1 &&
    password.search(atLeastOneCapCase) !== -1 &&
    password.search(atLeastOneSmallCase) !== -1 &&
    password.search(atLeastOneSpecialChar) !== -1
  ) {
    return true;
  } else {
    console.log(" password error");
    return false;
  }
};

//Route to register
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log(firstName, lastName, email, password);

    //Check if no field is empty
    if (!(firstName && lastName && email && password)) {
      return res.status(400).send("Please fill all fields");
    }

    //Check validation for fields
    if (!(isNameValid(firstName) && isNameValid(lastName))) {
      return res.status(400).send("Bad Credentials");
    }

    if (!(isEmailValid(email) && isPasswordValid(password))) {
      return res.status(400).send("Bad Credentials");
    }

    //Check if User already exists
    const oldUser = await User.findOne({ email: email.toLowerCase() });
    if (oldUser) {
      return res.status(409).send("User already registered");
    }

    //Add new user
    //Hash the password to save
    const hashedPassword = await bycrypt.hash(password, 10);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    //Add the token
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.TOKEN_KEY,
      { expiresIn: "1hr" }
    );

    user.token = token;

    return res.status(201).json(JSON.stringify(user));
  } catch (err) {
    console.log(err);
  }
});

//Route to User Login
app.post("/login", async (req, res) => {
  try {
    //User credentials
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("Provide all credentials");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await bycrypt.compare(password, user.password))) {
      //Give token to authentic user
      const token = jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.TOKEN_KEY,
        { expiresIn: "1hr" }
      );

      user.token = token;

      res.status(201).json(JSON.stringify(user));
    } else {
      return res.status(409).send("Invalid credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

//Route with added middleware for token verfication
app.get("/welcome", tokenVerification, (req, res) => {
  console.log(req.user);
  return res.send("Welcome boy");
});

module.exports = app;
