var express = require("express");
var router = express.Router();
const fs = require("fs");

var blockchain = require("../src/blockchain");
var { getPublicFromWallet, initWallet, getBalance } = require("../src/wallet");

let blockChain = new blockchain();

router.get("/mineBlock", function (req, res) {
  blockChain.addBlock(blockChain.generateNextBlock(""));
  res.json(blockChain.getLatestBlock());
});

// router.get("/balance", function (req, res) {
//   const balance = getBalance(getPublicFromWallet(), );
//   res.send({ balance: balance });
// });

router.get("/getLatestBlock", function (req, res) {
  result = blockChain.getLatestBlock();
  res.json(result);
});

router.get("/address", function (req, res) {
  const address = getPublicFromWallet();
  res.send({ address: address });
});

module.exports = router;
