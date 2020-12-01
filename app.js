const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const cors = require("cors");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const blockChainRouter = require("./routes/blockchain");

const { initP2PServer } = require("./src/p2p");
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

initP2PServer(6001);
initWallet(4000);

const privateKeyLocation = process.env.PRIVATE_KEY || `node/wallet/private_key`;
app.listen(4000, () => console.log("Server Up and running at 4000"));

module.exports = {
  privateKeyLocation,
  app,
};
