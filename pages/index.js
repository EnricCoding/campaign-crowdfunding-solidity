import { Component } from "react";
import factory from "../ethereum/factory";
import { Card, Button } from "semantic-ui-react";
import Link from "next/link";
import "semantic-ui-css/semantic.min.css";
import Layout from "../components/Layout/Layout";

class CampaignIndex extends Component {
  static async getInitialProps() {
    try {
      const campaigns = await factory.methods.getDeployedCampaigns().call();
      return { campaigns };
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return { campaigns: [] };
    }
  }

  renderCampaigns() {
    const { campaigns } = this.props;

    const items = campaigns.map((address) => {
      return {
        header: address,
        description: <Link href={`/campaigns/${address}`}>View Campaign</Link>,
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h1>Deployed Campaigns</h1>
        <Link href="/campaigns/new">
          <Button
            floated="right"
            content="Create Campaign"
            icon="add circle"
            primary
          />
        </Link>
        <h3>Available Campaigns:</h3>
        {this.renderCampaigns()}
      </Layout>
    );
  }
}

export default CampaignIndex;
