import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
  "0x3Ef200800206336D1Ed951ed890800B9742b3e1f"
);

export default instance;