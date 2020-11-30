"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const blockChain = require("./blockchain");
const sockets = [];
var MessageType;
let blockchain = new blockChain();

(function (MessageType) {
  MessageType[(MessageType["LatestQuery"] = 0)] = "LatestQuery";
  MessageType[(MessageType["AllQuery"] = 1)] = "AllQuery";
  MessageType[(MessageType["RESBlockchain"] = 2)] = "RESBlockchain";
})(MessageType || (MessageType = {}));

const initP2PServer = (p2pPort) => {
  const server = new WebSocket.Server({ port: p2pPort });
  server.on("connection", (ws) => {
    initConnection(ws);
  });
  console.log("Listening p2p port on:" + p2pPort);
};

const getSockets = () => sockets;

const initConnection = (ws) => {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
};

const JSONToObject = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const initMessageHandler = (ws) => {
  ws.on("message", (data) => {
    const message = JSONToObject(data);
    if (message === null) {
      console.log("Error! Cannot convert JSON data:" + data);
      return;
    }
    console.log("Message" + JSON.stringify(message));
    switch (message.type) {
      case MessageType.LatestQuery:
        write(ws, responseLatestMsg());
        break;
      case MessageType.AllQuery:
        write(ws, responseChainMsg());
        break;
      case MessageType.RESBlockchain:
        const receivedBlocks = JSONToObject(message.data);
        if (receivedBlocks === null) {
          console.log("Error! Received invalid blocks:");
          console.log(message.data);
          break;
        }
        handleBlockchainResponse(receivedBlocks);
        break;
    }
  });
};

const write = (ws, message) => ws.send(JSON.stringify(message));

const broadcast = (message) =>
  sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = () => ({
  type: MessageType.LatestQuery,
  data: null,
});

const queryAllMsg = () => ({ type: MessageType.AllQuery, data: null });

const responseChainMsg = () => ({
  type: MessageType.RESBlockchain,
  data: JSON.stringify(blockchain.getBlockchain()),
});

const responseLatestMsg = () => ({
  type: MessageType.RESBlockchain,
  data: JSON.stringify(blockchain.getLatestBlock()),
});

const responseTransactionPoolMsg = () => ({
  type: MessageType.RESPONSE_TRANSACTION_POOL,
  data: JSON.stringify(getTransactionPool()),
});

const initErrorHandler = (ws) => {
  const closeConnection = (myWs) => {
    console.log("Error! Connection failed to peer:" + myWs.url);
    sockets.splice(sockets.indexOf(myWs), 1);
  };
  ws.on("close", () => closeConnection(ws));
  ws.on("error", () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks) => {
  if (receivedBlocks.length === 0) {
    console.log("Received block chain size of 0");
    return;
  }

  const latestBlockHeld = blockchain.getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      "Blockchain possibly behind. We got: " +
        latestBlockHeld.index +
        " Peer got: " +
        latestBlockReceived.index
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      if (blockchain.addBlockToChain(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if (receivedBlocks.length === 1) {
      console.log("We have to query the chain from our peer");
      broadcast(queryAllMsg());
    } else {
      console.log("Received blockchain is longer than current blockchain");
      blockchain.replaceChain(receivedBlocks);
    }
  } else {
    console.log(
      "Warning! Received blockchain is not longer than received blockchain. Do nothing"
    );
  }
};

const broadcastLatest = () => {
  broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer) => {
  const ws = new WebSocket(newPeer);
  ws.on("open", () => {
    initConnection(ws);
  });
  ws.on("error", () => {
    console.log("Error! Connection failed!");
  });
};

const broadCastTransactionPool = () => {
  broadcast(responseTransactionPoolMsg());
};

exports.initP2PServer = initP2PServer;
exports.getSockets = getSockets;
exports.broadcastLatest = broadcastLatest;
exports.connectToPeers = connectToPeers;
exports.broadCastTransactionPool = broadCastTransactionPool;
