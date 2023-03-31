require("dotenv").config();
const express = require("express");
const bycrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  isNameValid,
  isEmailValid,
  isPasswordValid,
} = require("./utils/validation.js");

//Connect to the configured Mongoose db
require("./config/database.js").connect();

const User = require("./model/user.js");
const tokenVerification = require("./middleware/auth.js");

const app = express();

app.use(express.json());
app.use(cors());

//Route to register
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log(firstName, lastName, email, password);

    //Check if no field is empty
    if (!(firstName && lastName && email && password)) {
      return res.status(400).send("All fields not present");
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
      return res.status(401).send("User already registered");
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
    res.status(500).send("Internal Server Error");
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

    //Check if user credentials are valid
    if (!(isEmailValid(email) && isPasswordValid(password))) {
      return res.status(400).send("Please provide valid credentials");
    }

    //If the credentials are valid
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
      return res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server error");
  }
});

//Route with added middleware for token verfication
app.get("/welcome", tokenVerification, (req, res) => {
  console.log(req.user);
  return res.send("Welcome boy");
});

module.exports = app;
