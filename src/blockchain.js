const CryptoJS = require("crypto-js");
let util = require("./util");
let fs = require("fs");
const _ = require("lodash");
const {
  processTransactions,
  getCoinbaseTransaction,
} = require("./transaction");
const {
  getPublicFromWallet,
  findUnspentTxOuts,
  createTransaction,
  getPrivateFromWallet,
} = require("./wallet");
const {
  getTransactionPool,
  addToTransactionPool,
  updateTransactionPool,
} = require("./transacrionPool");
const { client } = require("../db/redis");
class block {
  constructor(index, timestamp, hash, previousHash, data, difficulty, nonce) {
    this.index = index;
    this.timestamp = timestamp;
    this.hash = hash;
    this.previousHash = previousHash;
    this.data = data;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

class blockchain {
  constructor() {
    this.blocks = [this.getGenesisBlock()];
    this.difficulty = 0;
    this.BLOCK_GENERATION_INTERVAL = 10; // In second
    this.DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // In block
  }

  loadChain() {
    try {
      let currentChain = fs.readFileSync("./db/output.json");
      let chainData = JSON.parse(currentChain);
      for (let i = 0; i < chainData.length; i++) {
        this.blocks[i] = new block(
          chainData[i].index,
          chainData[i].timestamp,
          chainData[i].hash,
          chainData[i].previousHash,
          chainData[i].data,
          chainData[i].difficulty,
          chainData[i].nonce
        );
      }
      this.blockchain = chainData;

      this.saveState();
      console.log("Load Chain Successfully ");
    } catch (err) {
      this.saveToLocal();
      console.log("init block")
    }
  }

  saveState() {
    const result = this.getLatestBlock();
    client.set("getLatestBlock", JSON.stringify(result), (error, result) => {
      if (error) {
        res.status(500).json({ error: error });
      } else {
        console.log("Save Blockchain State To Redis Successfully!");
      }
    });
  }

  saveToLocal() {
    const json = JSON.stringify(this.blocks);
    fs.writeFile("./db/output.json", json, (err) => {
      if (err) {
        console.error(err);
      }
      console.log("Create Block Successfully!");
    });
  }

  getGenesisBlock() {
    return new block(
      0,
      0,
      "948368f1eb3c037f19c2200142bf5a1bfecf2a884d06672d092bdd2b6c39f80d",
      0,
      {
        txIns: [{ signature: "", txOutId: "", txOutIndex: 0 }],
        txOuts: [
          {
            address:
              "04958cde0111f53b978b3895631d37c0226947ba2e545647b0186477546f72148399fbe6cb9a0ba9872b45ace67292439aaad08efd4a83c6e2172208cd595aa7bf",
            amount: 50,
          },
        ],
        id: "100559594d822d9de2fcabc3c2355d637ba01e00c67bd21b6f395f96bc7fbc60",
      },
      0,
      0
    );
  }

  calculateHash(index, timestamp, previousHash, data, difficulty, nonce) {
    return CryptoJS.SHA256(
      index + timestamp + previousHash + data + difficulty + nonce
    ).toString();
  }

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(newBlock) {
    const retVal = processTransactions(
      newBlock.data,
      this.getUnspentTxOuts(),
      newBlock.index
    );
    if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
      this.blocks.push(newBlock);
      this.setUnspentTxOuts(retVal);
      updateTransactionPool(this.unspentTxOuts);
      this.saveToLocal();
      this.saveState();
      return true;
    }
    return false;
  }

  isValidNewBlock(newBlock, previousBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      return false;
    } else if (
      this.calculateHash(
        newBlock.index,
        newBlock.timestamp,
        newBlock.previousHash,
        newBlock.data,
        newBlock.difficulty,
        newBlock.nonce
      ) !== newBlock.hash
    ) {
      return false;
    } else {
      return true;
    }
  }

  hashMatchDifficulty(hash, difficulty) {
    let u = new util();
    const hashInBinary = u.hex2bin(hash);
    const requiredPrefix = "0".repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
  }

  generateNextBlock() {
    const coinbaseTx = getCoinbaseTransaction(
      getPublicFromWallet(),
      this.getLatestBlock().index + 1
    );
    const blockdata = [coinbaseTx].concat(getTransactionPool());
    const previousBlock = this.getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = Math.round(new Date().getTime() / 1000);
    const difficulty = this.getDifficulty(this.blocks);
    let nonce = 0;
    while (true) {
      const nextHash = this.calculateHash(
        nextIndex,
        nextTimestamp,
        previousBlock.hash,
        blockdata,
        difficulty,
        nonce
      );
      if (this.hashMatchDifficulty(nextHash, difficulty)) {
        return this.addBlock(
          new block(
            nextIndex,
            nextTimestamp,
            nextHash,
            previousBlock.hash,
            blockdata,
            difficulty,
            nonce
          )
        );
      }
      nonce++;
    }
  }

  getDifficulty(aBlockChain) {
    const latestBlock = this.getLatestBlock();
    if (
      latestBlock.index % this.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      latestBlock.index !== 0
    ) {
      return this.getAdjustedDifficulty(latestBlock, aBlockChain);
    } else {
      return latestBlock.difficulty;
    }
  }

  getAdjustedDifficulty(latestBlock, aBlockChain) {
    const prevAdjustmentBlock =
      aBlockChain[aBlockChain.length - this.DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected =
      this.BLOCK_GENERATION_INTERVAL * this.DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;

    if (timeTaken < timeExpected / 2) {
      //console.log("increase");
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      //console.log("decrease");
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      //console.log("unchange");
      return prevAdjustmentBlock.difficulty;
    }
  }

  // Transaction
  unspentTxOuts() {
    processTransactions(this.blocks[0].data, [], 0);
  }

  getUnspentTxOuts() {
    return _.cloneDeep(this.unspentTxOuts);
  }

  setUnspentTxOuts(newUnspentTxOut) {
    this.unspentTxOuts = newUnspentTxOut;
  }

  getMyUnspentTransactionOutputs() {
    return findUnspentTxOuts(getPublicFromWallet(), this.getUnspentTxOuts());
  }

  generatenextBlockWithTransaction(receiverAddress, amount) {
    if (typeof amount !== "number") {
      throw Error("invalid amount");
    }
    var coinbaseTx = getCoinbaseTransaction(
      getPublicFromWallet(),
      this.getLatestBlock().index + 1
    );
    var tx = createTransaction(
      receiverAddress,
      amount,
      getPrivateFromWallet(),
      this.getUnspentTxOuts(),
      getTransactionPool()
    );
    var blockData = [coinbaseTx, tx];
    return this.generateNextBlock();
  }

  sendTransaction(address, amount) {
    var tx = createTransaction(
      address,
      amount,
      getPrivateFromWallet(),
      this.getUnspentTxOuts(),
      getTransactionPool()
    );
    addToTransactionPool(tx, this.getUnspentTxOuts());
    return tx;
  }
}

module.exports = blockchain;
