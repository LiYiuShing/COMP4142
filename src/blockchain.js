const CryptoJS = require("crypto-js");
let util = require('./util');

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

    getGenesisBlock() {
        return new block(0, 0, "948368f1eb3c037f19c2200142bf5a1bfecf2a884d06672d092bdd2b6c39f80d", 0, "Genesis Block", 0, 0);
    }

    calculateHash(index, timestamp, previousHash, data, difficulty, nonce) {
        return CryptoJS.SHA256(index + timestamp + previousHash + data + difficulty + nonce).toString();
    }

    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    addBlock(newBlock) {
        if(this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blocks.push(newBlock)
            return true  
          }
        return false
    }
    
    isValidNewBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index) {
            return false;
        }
        else if (previousBlock.hash !== newBlock.previousHash) {
            return false;
        }
        else if (this.calculateHash(newBlock.index, newBlock.timestamp, newBlock.previousHash, newBlock.data, newBlock.difficulty, newBlock.nonce) !== newBlock.hash) {
            return false;
        }
        else {
            return true;
        }
    }

    hashMatchDifficulty(hash, difficulty) {
        let u = new util();
        const hashInBinary = u.hex2bin(hash);
        const requiredPrefix = '0'.repeat(difficulty);
        return hashInBinary.startsWith(requiredPrefix);
    }

    generateNextBlock(blockdata) {
        const previousBlock = this.getLatestBlock();
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = new Date().getTime();
        const difficulty = this.getDifficulty(this.blocks);
        let nonce = 0;
        while (true) {
            const nextHash = this.calculateHash(nextIndex, nextTimestamp, previousBlock.hash, blockdata, difficulty, nonce);
            if (this.hashMatchDifficulty(nextHash, difficulty)) {
                return new block(nextIndex, nextTimestamp, nextHash, previousBlock.hash, blockdata, difficulty, nonce);
            }
            nonce++;
        }
    }

    getDifficulty(aBlockChain) {
        const latestBlock = this.getLatestBlock();
        if (latestBlock.index % this.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
            return this.getAdjustedDifficulty(latestBlock, aBlockChain);
        } else {
            return latestBlock.difficulty;
        }
    }

    getAdjustedDifficulty(latestBlock, aBlockChain) {
        const prevAdjustmentBlock = aBlockChain[aBlockChain.length - this.DIFFICULTY_ADJUSTMENT_INTERVAL];
        const timeExpected = this.BLOCK_GENERATION_INTERVAL * this.DIFFICULTY_ADJUSTMENT_INTERVAL;
        const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;

        if (timeTaken < timeExpected / 2) {
            //console.log("increase");
            return prevAdjustmentBlock.difficulty + 1;
        }
        else if (timeTaken > timeExpected * 2) {
            //console.log("decrease");
            return prevAdjustmentBlock.difficulty - 1;
        }
        else {
            //console.log("unchange");
            return prevAdjustmentBlock.difficulty;
        }
    }
}

module.exports = blockchain;