const express = require("express");
const router = express.Router();

const blockchain = require("../src/blockchain");
const { getPublicFromWallet, getBalance } = require("../src/wallet");
const { getTransactionPool } = require("../src/transacrionPool.js");
const { processTransactions } = require("../src/transaction");
const { client } = require("../db/redis");

let blockChain = new blockchain();
blockChain.unspentTxOuts = processTransactions(
  [blockChain.getGenesisBlock().data],
  [],
  0
);

router.get("/mineBlock", function (req, res) {
  blockChain.generateNextBlock();
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
  client.get("key", (error, result) => {
    console.log(error, result);
    // if (error) {
    //   res.status(500).json({ error: error });
    // }
  });
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

router.post("/sendTransaction", (req, res) => {
  try {
    const address = req.body.address;
    const amount = Number(req.body.amount);

    if (address === undefined || amount === undefined) {
      throw Error("invalid address or amount");
    }
    const resp = blockChain.sendTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

router.get("/unspentTransactionOutputs", (req, res) => {
  res.send(blockChain.getUnspentTxOuts());
});

router.get("/myUnspentTransactionOutputs", (req, res) => {
  res.send(blockChain.getMyUnspentTransactionOutputs());
});

router.get("/peers", (req, res) => {
  res.send(
    getSockets().map(
      (s) => s._socket.remoteAddress + ":" + s._socket.remotePort
    )
  );
});

router.post("/addPeer", (req, res) => {
  connectToPeers(req.body.peer);
  res.send();
});

module.exports = router;
