require("dotenv").config();

//connect to the configured mongoose db
require("./config/database.js").connect();

const express = require("express");
const app = express();

app.use(express.json());

module.exports = app;
