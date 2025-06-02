const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaingPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaingPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Campaign.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

fs.ensureDirSync(buildPath);

for (const contractName in output.contracts["Campaign.sol"]) {
  const filePath = path.resolve(buildPath, `${contractName}.json`);
  fs.outputJsonSync(filePath, output.contracts["Campaign.sol"][contractName]);
}
