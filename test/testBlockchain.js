var blockchain = require('../src/blockchain');

var newBlockChain = new blockchain();

// console.log(newBlockChain.getGenesisBlock());
// console.log(newBlockChain.calculateHash(0, 0, 0, "Genesis Block", 0 , 0));
// console.log(newBlockChain.getLatestBlock());

newBlockChain.addBlock(newBlockChain.generateNextBlock("A"));
newBlockChain.addBlock(newBlockChain.generateNextBlock("A"));
// let i = 0
// for (let i = 0; i < 1000; i++) {
//     newBlockChain.addBlock(newBlockChain.generateNextBlock("A"));
// }

console.log(newBlockChain);
// console.log(newBlockChain.getDifficulty());