const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

//configuring the db

exports.connect = () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Successfully connected to the db.");
    })
    .catch((error) => {
      console.log("An error encountered while connecting the db : " + error);
      process.exit(1);
    });
};
