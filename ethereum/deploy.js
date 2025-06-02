const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");
const { abi, evm } = compiledFactory;
const bytecode = evm.bytecode.object;

const mnemonic = process.env.MNEMONIC;
const infuraKey = process.env.INFURA_KEY;

if (!mnemonic || !infuraKey) {
  console.error("Error: MNEMONIC or INFURA_KEY not set in environment.");
  process.exit(1);
}

const provider = new HDWalletProvider(
  mnemonic,
  `https://sepolia.infura.io/v3/${infuraKey}`
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  const balance = await web3.eth.getBalance(accounts[0]);
  console.log(
    "Available balance on Sepolia:",
    web3.utils.fromWei(balance, "ether"),
    "ETH"
  );

  console.log("Bytecode size:", bytecode.length);

  try {
    const result = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode })
      .send({ gas: "3000000", from: accounts[0] });

    console.log("Deployed contract address:", result.options.address);
  } catch (error) {
    console.error("Error deploying:", error);
  }

  provider.engine.stop();
};

deploy();
