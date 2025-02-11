const express = require("express");
const router = express.Router();

const blockchain = require("../src/blockchain");
const { getPublicFromWallet, getBalance } = require("../src/wallet");
const { getTransactionPool } = require("../src/transacrionPool.js");
const { processTransactions } = require("../src/transaction");
const { client } = require("../db/redis");
const { connectToPeers, getSockets } = require("../src/p2p");

let blockChain = new blockchain();

blockChain.unspentTxOuts = processTransactions(
  [blockChain.getGenesisBlock().data],
  [],
  0
);
blockChain.saveState();
blockChain.loadChain();

router.get("/getLatestBlock", function (req, res) {
  blockChain.loadChain();
  const state = client.get("getLatestBlock", (err, result) => {
    if (err) console.log(err);
    const data = JSON.parse(result);
    console.log("Get Redis State", data);
    res.json(data);
  });
  if (!state) res.json(blockChain.getLatestBlock());
});

router.get("/mineBlock", function (req, res) {
  blockChain.loadChain();
  blockChain.generateNextBlock();
  const state = client.get("getLatestBlock", (err, result) => {
    if (err) console.log(err);
    const data = JSON.parse(result);
    console.log("Get Redis State", data);
    res.json(data);
  });
  if (!state) res.json(blockChain.getLatestBlock());
});

router.get("/balance", function (req, res) {
  blockChain.loadChain();
  const balance = getBalance(
    getPublicFromWallet(),
    blockChain.getUnspentTxOuts()
  );
  res.send({ balance: balance });
});

router.get("/address", function (req, res) {
  blockChain.loadChain();
  const address = getPublicFromWallet();
  res.send({ address: address });
});

router.get("/transactionPool", (req, res) => {
  res.send(getTransactionPool());
});

router.post("/sendTransaction", (req, res) => {
  blockChain.loadChain();
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
  blockChain.loadChain();
  res.send(blockChain.getUnspentTxOuts());
});

router.get("/myUnspentTransactionOutputs", (req, res) => {
  blockChain.loadChain();
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
