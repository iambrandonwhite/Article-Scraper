var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var express = require("express");
var app = express();


var mongojs = require("mongojs");
var db = mongojs("BrandonDataBase", ["Article-Scraper"]);
mongoose.connect(
  "mongodb://brandon:pa55w0rd@ds013495.mlab.com:13495/heroku_w11scczl",
  {
    useNewUrlParser: true
  }
);


const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/BrandonDatabase";
mongoose.connect(MONGODB_URI);


app.use(logger("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);


app.use(express.static(process.cwd() + "/public"));


var exphbs = require("express-handlebars");
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connected to Mongoose");
});


var routes = require("./controller/controller.js");
app.use("/", routes);


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on localhost:" + port);
});