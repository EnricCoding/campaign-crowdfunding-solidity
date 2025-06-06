const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

const server = ganache.server({
  chain: {
    allowUnlimitedContractSize: true,
  },
});

let web3;
let accounts;
let factory;
let campaignAddress;
let campaign;

before(async () => {
  await server.listen(8545);
  web3 = new Web3(server.provider);
});

after(async () => {
  await server.close();
});

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: "10000000" });

  const gasEstimate = await factory.methods.createCampaign("100").estimateGas({
    from: accounts[0],
  });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: gasEstimate + BigInt(100000),
  });

  const deployed = await factory.methods.getPloyedCampaigns().call();
  [campaignAddress] = deployed;

  if (!campaignAddress) throw new Error("No se obtuvo dirección de campaña");

  campaign = new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe("Campaign", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.strictEqual(accounts[0], manager);
  });

  it("allows people to contribute money and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      value: web3.utils.toWei("10", "ether"),
      from: accounts[1],
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "200",
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", "100", accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    const request = await campaign.methods.requests(0).call();

    assert.equal("Buy batteries", request.description);
  });

  it("processes requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods
      .createRequest("A", web3.utils.toWei("5", "ether"), accounts[1])
      .send({ from: accounts[0], gas: "1000000" });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);
    console.log(balance);
    assert(balance > 104);
  });
});
