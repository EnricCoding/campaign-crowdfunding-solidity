import { Card, Grid, Segment, Header } from "semantic-ui-react";
import Layout from "../../../components/Layout/Layout";
import web3 from "../../../ethereum/web3";
import campaign from "../../../ethereum/campaign";
import ContributeForm from "../../../components/ContributeForm/ContributeForm";
import { useState } from "react";
import Link from "next/link";
import styles from "./Address.module.css" 

const CampaignShow = ({ initialSummary, address }) => {
  const [summary, setSummary] = useState(initialSummary);

  const renderCards = () => {
    if (!summary) return null;

    const {
      minimumContribution,
      balance,
      requestsCount,
      approversCount,
      manager,
    } = summary;

    const items = [
      {
        header: manager,
        meta: "Creator Address",
        description:
          "The creator of this campaign can create requests to withdraw funds.",
        style: { overflowWrap: "break-word" },
      },
      {
        header: minimumContribution,
        meta: "Minimum Contribution (wei)",
        description:
          "You must contribute at least this amount to become a contributor.",
      },
      {
        header: requestsCount,
        meta: "Number of Requests",
        description:
          "A request attempts to withdraw money from the campaign. They must be approved by contributors.",
      },
      {
        header: approversCount,
        meta: "Number of Contributors",
        description:
          "Number of people who have already contributed to this campaign.",
      },
      {
        header: web3.utils.fromWei(balance, "ether"),
        meta: "Campaign Balance (ether)",
        description:
          "How much money remains available to spend on this campaign.",
      },
    ];

    return <Card.Group items={items} />;
  };

  const refreshSummary = async () => {
    const camp = campaign(address);
    const updated = await camp.methods.getSummary().call();
    setSummary({
      minimumContribution: updated[0].toString(),
      balance: updated[1].toString(),
      requestsCount: updated[2].toString(),
      approversCount: updated[3].toString(),
      manager: updated[4],
    });
  };

  return (
    <Layout>
      <Segment padded="very" raised>
        <Header as="h2" textAlign="center">
          Campaign Details
        </Header>

        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {renderCards()}
              <div className={styles.mt4}>
                <Link href={`/campaigns/${address}/requests`}>
                  View Requests
                </Link>
              </div>
            </Grid.Column>
            <Grid.Column width={6}>
              <ContributeForm
                address={address}
                onContributionSuccess={refreshSummary}
              ></ContributeForm>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Layout>
  );
};

CampaignShow.getInitialProps = async (props) => {
  console.log("props", props);

  if (!props.query.address) {
    console.error("No campaign address provided.");
    return { summary: null };
  }

  console.log("props.query.address", props.query.address);
  const camp = campaign(props.query.address);

  try {
    const summary = await camp.methods.getSummary().call();
    console.log("Data:", summary);

    return {
      address: props.query.address,
      initialSummary: {
        minimumContribution: summary[0].toString(),
        balance: summary[1].toString(),
        requestsCount: summary[2].toString(),
        approversCount: summary[3].toString(),
        manager: summary[4],
      },
    };
  } catch (error) {
    console.error("Error loading campaign details:", error);
    return {};
  }
};

export default CampaignShow;
