define("abc", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.addBlockToChain = exports.replaceChain = exports.isValidBlockStructure = exports.getAccountBalance = exports.getMyUnspentTransactionOutputs = exports.handleReceivedTransaction = exports.generatenextBlockWithTransaction = exports.generateNextBlock = exports.generateRawNextBlock = exports.sendTransaction = exports.getLatestBlock = exports.getUnspentTxOuts = exports.getBlockchain = exports.Block = void 0;
    var CryptoJS = require("crypto-js");
    var util = require("../src/util");
    var fs = require("fs");
    var _ = require("lodash");
    var _a = require("../src/transaction"), processTransactions = _a.processTransactions, getCoinbaseTransaction = _a.getCoinbaseTransaction;
    var _b = require("../src/wallet"), getPublicFromWallet = _b.getPublicFromWallet, findUnspentTxOuts = _b.findUnspentTxOuts, createTransaction = _b.createTransaction, getPrivateFromWallet = _b.getPrivateFromWallet;
    var _c = require("../src/transacrionPool"), getTransactionPool = _c.getTransactionPool, addToTransactionPool = _c.addToTransactionPool, updateTransactionPool = _c.updateTransactionPool;
    var UnspentTxOut = /** @class */ (function () {
        function UnspentTxOut(txOutId, txOutIndex, address, amount) {
            this.txOutId = txOutId;
            this.txOutIndex = txOutIndex;
            this.address = address;
            this.amount = amount;
        }
        return UnspentTxOut;
    }());
    var TxIn = /** @class */ (function () {
        function TxIn() {
        }
        return TxIn;
    }());
    var TxOut = /** @class */ (function () {
        function TxOut(address, amount) {
            this.address = address;
            this.amount = amount;
        }
        return TxOut;
    }());
    var Transaction = /** @class */ (function () {
        function Transaction() {
        }
        return Transaction;
    }());
    var Block = /** @class */ (function () {
        function Block(index, hash, previousHash, timestamp, data, difficulty, nonce) {
            this.index = index;
            this.previousHash = previousHash;
            this.timestamp = timestamp;
            this.data = data;
            this.hash = hash;
            this.difficulty = difficulty;
            this.nonce = nonce;
        }
        return Block;
    }());
    exports.Block = Block;
    var genesisTransaction = {
        'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
        'txOuts': [{
                'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
                'amount': 50
            }],
        'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
    };
    var genesisBlock = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], 0, 0);
    var blockchain = [genesisBlock];
    console.log('s', blockchain[0]);
    // the unspent txOut of genesis block is set to unspentTxOuts on startup
    var unspentTxOuts = processTransactions(blockchain[0].data, [], 0);
    var getBlockchain = function () { return blockchain; };
    exports.getBlockchain = getBlockchain;
    var getUnspentTxOuts = function () { return _.cloneDeep(unspentTxOuts); };
    exports.getUnspentTxOuts = getUnspentTxOuts;
    // and txPool should be only updated at the same time
    var setUnspentTxOuts = function (newUnspentTxOut) {
        console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
        unspentTxOuts = newUnspentTxOut;
    };
    var getLatestBlock = function () { return blockchain[blockchain.length - 1]; };
    exports.getLatestBlock = getLatestBlock;
    // in seconds
    var BLOCK_GENERATION_INTERVAL = 10;
    // in blocks
    var DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
    var getDifficulty = function (aBlockchain) {
        var latestBlock = aBlockchain[blockchain.length - 1];
        if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
            return getAdjustedDifficulty(latestBlock, aBlockchain);
        }
        else {
            return latestBlock.difficulty;
        }
    };
    var getAdjustedDifficulty = function (latestBlock, aBlockchain) {
        var prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
        var timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
        var timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        if (timeTaken < timeExpected / 2) {
            return prevAdjustmentBlock.difficulty + 1;
        }
        else if (timeTaken > timeExpected * 2) {
            return prevAdjustmentBlock.difficulty - 1;
        }
        else {
            return prevAdjustmentBlock.difficulty;
        }
    };
    var getCurrentTimestamp = function () { return Math.round(new Date().getTime() / 1000); };
    var generateRawNextBlock = function (blockData) {
        var previousBlock = getLatestBlock();
        var difficulty = getDifficulty(getBlockchain());
        var nextIndex = previousBlock.index + 1;
        var nextTimestamp = getCurrentTimestamp();
        var newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
        if (addBlockToChain(newBlock)) {
            return newBlock;
        }
        else {
            return null;
        }
    };
    exports.generateRawNextBlock = generateRawNextBlock;
    // gets the unspent transaction outputs owned by the wallet
    var getMyUnspentTransactionOutputs = function () {
        return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts());
    };
    exports.getMyUnspentTransactionOutputs = getMyUnspentTransactionOutputs;
    var generateNextBlock = function () {
        var coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
        var blockData = [coinbaseTx].concat(getTransactionPool());
        return generateRawNextBlock(blockData);
    };
    exports.generateNextBlock = generateNextBlock;
    var generatenextBlockWithTransaction = function (receiverAddress, amount) {
        if (typeof amount !== 'number') {
            throw Error('invalid amount');
        }
        var coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
        var tx = createTransaction(receiverAddress, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
        var blockData = [coinbaseTx, tx];
        return generateRawNextBlock(blockData);
    };
    exports.generatenextBlockWithTransaction = generatenextBlockWithTransaction;
    var findBlock = function (index, previousHash, timestamp, data, difficulty) {
        var nonce = 0;
        while (true) {
            var hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
            if (hashMatchesDifficulty(hash, difficulty)) {
                return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
            }
            nonce++;
        }
    };
    var getAccountBalance = function () {
        return;
    };
    exports.getAccountBalance = getAccountBalance;
    var sendTransaction = function (address, amount) {
        var tx = createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
        addToTransactionPool(tx, getUnspentTxOuts());
        return tx;
    };
    exports.sendTransaction = sendTransaction;
    var calculateHashForBlock = function (block) {
        return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
    };
    var calculateHash = function (index, previousHash, timestamp, data, difficulty, nonce) {
        return CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();
    };
    var isValidBlockStructure = function (block) {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'object';
    };
    exports.isValidBlockStructure = isValidBlockStructure;
    var isValidNewBlock = function (newBlock, previousBlock) {
        if (!isValidBlockStructure(newBlock)) {
            console.log('invalid block structure: %s', JSON.stringify(newBlock));
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        }
        else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        }
        else if (!isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        }
        else if (!hasValidHash(newBlock)) {
            return false;
        }
        return true;
    };
    var getAccumulatedDifficulty = function (aBlockchain) {
        return aBlockchain
            .map(function (block) { return block.difficulty; })
            .map(function (difficulty) { return Math.pow(2, difficulty); })
            .reduce(function (a, b) { return a + b; });
    };
    var isValidTimestamp = function (newBlock, previousBlock) {
        return (previousBlock.timestamp - 60 < newBlock.timestamp)
            && newBlock.timestamp - 60 < getCurrentTimestamp();
    };
    var hasValidHash = function (block) {
        if (!hashMatchesBlockContent(block)) {
            console.log('invalid hash, got:' + block.hash);
            return false;
        }
        if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
            console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        }
        return true;
    };
    var hashMatchesBlockContent = function (block) {
        var blockHash = calculateHashForBlock(block);
        return blockHash === block.hash;
    };
    var hashMatchesDifficulty = function (hash, difficulty) {
        var requiredPrefix = '0'.repeat(difficulty);
        return;
    };
    /*
        Checks if the given blockchain is valid. Return the unspent txOuts if the chain is valid
     */
    var isValidChain = function (blockchainToValidate) {
        console.log('isValidChain:');
        console.log(JSON.stringify(blockchainToValidate));
        var isValidGenesis = function (block) {
            return JSON.stringify(block) === JSON.stringify(genesisBlock);
        };
        if (!isValidGenesis(blockchainToValidate[0])) {
            return null;
        }
        /*
        Validate each block in the chain. The block is valid if the block structure is valid
          and the transaction are valid
         */
        var aUnspentTxOuts = [];
        for (var i = 0; i < blockchainToValidate.length; i++) {
            var currentBlock = blockchainToValidate[i];
            if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return null;
            }
            aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
            if (aUnspentTxOuts === null) {
                console.log('invalid transactions in blockchain');
                return null;
            }
        }
        return aUnspentTxOuts;
    };
    var addBlockToChain = function (newBlock) {
        if (isValidNewBlock(newBlock, getLatestBlock())) {
            console.log("sdsdsdsdsdsdsdsdsdsd()", getUnspentTxOuts());
            var retVal = processTransactions(newBlock.data, getUnspentTxOuts(), newBlock.index);
            if (retVal === null) {
                console.log('block is not valid in terms of transactions');
                return false;
            }
            else {
                console.log(retVal);
                blockchain.push(newBlock);
                setUnspentTxOuts(retVal);
                updateTransactionPool(unspentTxOuts);
                return true;
            }
        }
        return false;
    };
    exports.addBlockToChain = addBlockToChain;
    var replaceChain = function (newBlocks) {
        var aUnspentTxOuts = isValidChain(newBlocks);
        var validChain = aUnspentTxOuts !== null;
        if (validChain &&
            getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            blockchain = newBlocks;
            setUnspentTxOuts(aUnspentTxOuts);
            updateTransactionPool(unspentTxOuts);
        }
        else {
            console.log('Received blockchain invalid');
        }
    };
    exports.replaceChain = replaceChain;
    var handleReceivedTransaction = function (transaction) {
        addToTransactionPool(transaction, getUnspentTxOuts());
    };
    exports.handleReceivedTransaction = handleReceivedTransaction;
});
