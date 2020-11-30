const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const cors = require("cors");
const bodyParser = require("body-parser");

const client = require("./db/redis").client;

const indexRouter = require("./routes/index");
const blockChainRouter = require("./routes/blockchain");

const { connectToPeers, getSockets, initP2PServer } = require("./src/p2p");
const { initWallet } = require("./src/wallet");

var app = express();

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Main

app.use("/", indexRouter);
app.use("/blockchain", blockChainRouter);

initP2PServer(6002);
initWallet(4001);

app.listen(4001, () => console.log("Server Up and running at 4001"));

module.exports = app;
