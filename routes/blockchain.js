var express = require("express");
var router = express.Router();
const fs = require("fs");

var blockchain = require("../src/blockchain");
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
  res.json(blockChain);
});

module.exports = router;
