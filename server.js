"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var expect = require("chai").expect;
var cors = require("cors");
var helmet = require("helmet");
var dotenv = require("dotenv");
var mongoose = require("mongoose");

var apiRoutes = require("./routes/api.js");
var fccTestingRoutes = require("./routes/fcctesting.js");
var runner = require("./test-runner");

dotenv.config();

var app = express();
app.use(
  helmet.frameguard({
    action: "sameorigin"
  })
);
app.use(helmet.dnsPrefetchControl());
app.use(
  helmet.referrerPolicy({
    policy: "same-origin"
  })
);

mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;

db.on("err", function onDBError(err) {
  console.log("Error connecting to database");
  console.log(err);
});

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route("/b/:board/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

db.once("open", function onDBOpen() {
  //Routing for API
  app.use(apiRoutes);

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + (process.env.PORT || 3000));
    if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
      setTimeout(function() {
        try {
          runner.run();
        } catch (e) {
          var error = e;
          console.log("Tests are not valid:");
          console.log(error);
        }
      }, 1500);
    }
  });
});

module.exports = {
  app,
  db
}; //for testing
