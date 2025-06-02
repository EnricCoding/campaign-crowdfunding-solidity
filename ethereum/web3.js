import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  const infuraKey = process.env.INFURA_KEY;

  if (!infuraKey) {
    throw new Error("Missing INFURA_KEY in environment.");
  }
  const provider = new Web3.providers.HttpProvider(
    `https://sepolia.infura.io/v3/${infuraKey}`
  );
  web3 = new Web3(provider);
}

export default web3;
