async function getAddress() {
  const response = await fetch("/blockchain/address");
  const result = await response.json();
  return result;
}

async function getBalance() {
  const response = await fetch("/blockchain/balance");
  const result = await response.json();
  return result;
}

async function mineBlock() {
  const response = await fetch("/blockchain/mineBlock");
  const result = await response.json();
  balance = await getBalance();
  document.getElementById("balance").innerHTML = balance.balance;
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

async function getTransactionPool() {
  const response = await fetch("/blockchain/transactionPool");
  const result = await response.json();
  document.getElementById("transactionPool").innerHTML = JSON.stringify(
    result,
    null,
    "\t"
  );
}
async function transaction() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var address = document.getElementById("addressVal").value;
  var amount = document.getElementById("amountVal").value;

  var raw = JSON.stringify({
    address: address,
    amount: amount,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  await fetch("/blockchain/sendTransaction", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));

    await getTransactionPool();
}

async function init() {
  address = await getAddress();
  balance = await getBalance();
  await getLatestBlock();

  document.getElementById("publicAddress").innerHTML = address.address;
  document.getElementById("balance").innerHTML = balance.balance;

  console.log(address);
}
