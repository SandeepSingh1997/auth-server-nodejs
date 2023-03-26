const express = require("express");
const cors = require("cors");
const app = express();

//Add cors middleware to allow routes from different origin other than the application
app.use(cors());
app.use(express.json());

app.use("/login", (req, res) => {
  console.log(req.body.username + " : " + req.body.password);
  res.setHeader("Content-Type", "application/json");
  res.json({
    isValid: true,
  });
});

app.listen(8080, () => console.log("Token server running"));
