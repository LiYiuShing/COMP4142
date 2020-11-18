var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var cors = require("cors");
var bodyParser = require("body-parser");

var indexRouter = require("./routes/index");

// var connect = require("./database");

var app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Main 
app.use("/", indexRouter);

app.listen(4000, () => console.log("Server Up and running at 4000"));

module.exports = app;
