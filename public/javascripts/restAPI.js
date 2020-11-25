function getAddress() {}

function getBalance() {}

function sendTransaction() {}

async function mineBlock() {
  const response = await fetch("/blockchain/mineBlock");
  const result = await response.json();
  console.log(result);
}

function getTransactionPool() {}
