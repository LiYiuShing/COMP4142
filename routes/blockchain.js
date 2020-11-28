var express = require("express");
var router = express.Router();
const fs = require("fs");

var blockchain = require("../src/blockchain");
var { getPublicFromWallet, initWallet, getBalance } = require("../src/wallet");
var { getTransactionPool } = require("../src/transacrionPool.js");

let blockChain = new blockchain();

router.get("/mineBlock", function (req, res) {
  blockChain.addBlock(blockChain.generateNextBlock(""));
  res.json(blockChain.getLatestBlock());
});

router.get("/balance", function (req, res) {
  const balance = getBalance(
    getPublicFromWallet(),
    blockChain.getUnspentTxOuts()
  );
  res.send({ balance: balance });
});

router.get("/getLatestBlock", function (req, res) {
  result = blockChain.getLatestBlock();
  res.json(result);
});

router.get("/address", function (req, res) {
  const address = getPublicFromWallet();
  res.send({ address: address });
});

router.get("/transactionPool", (req, res) => {
  res.send(getTransactionPool());
});

// router.post("/sendTransaction", (req, res) => {
//   try {
//     const address = req.body.address;
//     const amount = req.body.amount;

//     if (address === undefined || amount === undefined) {
//       throw Error("invalid address or amount");
//     }
//     const resp = blockChain.sendTransaction(address, amount);
//     res.send(resp);
//   } catch (e) {
//     console.log(e.message);
//     res.status(400).send(e.message);
//   }
// });

router.post("/sendTransaction", (req, res) => {
  const address = req.body.address;
  const amount = req.body.amount;

  if (address === undefined || amount === undefined) {
    throw Error("invalid address or amount");
  }
  const resp = blockChain.generatenextBlockWithTransaction(address, amount);
  res.send(resp);
});

router.get("/unspentTransactionOutputs", (req, res) => {
  res.send(blockChain.getUnspentTxOuts());
});

router.get("/myUnspentTransactionOutputs", (req, res) => {
  res.send(blockChain.getMyUnspentTransactionOutputs());
});


module.exports = router;
