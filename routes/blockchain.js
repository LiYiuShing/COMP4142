var express = require("express");
var router = express.Router();
const fs = require("fs");

var blockchain = require("../src/blockchain");
var { getPublicFromWallet, initWallet, getBalance } = require("../src/wallet");

let blockChain = new blockchain();
storeIntoJSON(blockChain);

function storeIntoJSON(data) {
  const json = JSON.stringify(data);
  fs.writeFile("./db/output.json", json, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Create Block Successfully!");
  });
}

router.get("/mineBlock", function (req, res) {
  blockChain.addBlock(blockChain.generateNextBlock(""));
  storeIntoJSON(blockChain);
  res.json(blockChain.getLatestBlock());
});

// router.get("/balance", function (req, res) {
//   const balance = getBalance(getPublicFromWallet(), );
//   res.send({ balance: balance });
// });

router.get("/address", function (req, res) {
  const address = getPublicFromWallet();
  res.send({ address: address });
});

module.exports = router;
