async function getAddress() {
  const response = await fetch("/blockchain/address");
  const result = await response.json();
  return result;
}

// async function getBalance() {
//   const response = await fetch("/blockchain/balance");
//   const result = await response.json();
//   return result;
// }

function sendTransaction() {}

async function mineBlock() {
  const response = await fetch("/blockchain/mineBlock");
  const result = await response.json();
  document.getElementById("createBlock").innerHTML = JSON.stringify(
    result,
    null,
    "\t"
  );
}

async function getLatestBlock() {
  const response = await fetch("/blockchain/getLatestBlock");
  const result = await response.json();
  document.getElementById("createBlock").innerHTML = JSON.stringify(
    result,
    null,
    "\t"
  );
}

function getTransactionPool() {}

async function init() {
  address = await getAddress();
  // balance = await getBalance();
  await getLatestBlock();

  document.getElementById("publicAddress").innerHTML = address.address;
  console.log(address);
}
