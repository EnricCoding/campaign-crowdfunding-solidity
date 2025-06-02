import { useState } from "react";
import {
  Form,
  Button,
  Input,
  Message,
  Segment,
  Header,
  Icon,
} from "semantic-ui-react";
import Layout from "../../components/Layout/Layout";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { useRouter } from "next/router";

const CampaignsNew = () => {
  const [minContribution, setMinContribution] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (e) => {
    setMinContribution(e.target.value);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validateInput = () => {
    if (
      !minContribution ||
      isNaN(minContribution) ||
      Number(minContribution) <= 0
    ) {
      setErrorMessage("Please enter a numeric value greater than 0.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const accounts = await web3.eth.getAccounts();

      await factory.methods
        .createCampaign(minContribution)
        .send({ from: accounts[0] });

      setSuccessMessage("Campaign created successfully.");
      setMinContribution("");
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      setErrorMessage(`${error.message}`);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <Segment padded="very" raised>
        <Header as="h2" textAlign="center">
          Create a New Campaign
        </Header>

        <Form
          onSubmit={onSubmit}
          error={!!errorMessage}
          success={!!successMessage}
        >
          <Form.Field>
            <label>Minimum Contribution Amount</label>
            <Input
              value={minContribution}
              onChange={onChange}
              placeholder="e.g.: 0.1"
              labelPosition="right"
              label="ETH"
            />
          </Form.Field>

          {errorMessage && (
            <Message error header="Oops..." content={errorMessage} />
          )}

          {successMessage && (
            <Message success header="Success!" content={successMessage} />
          )}

          <Button
            type="submit"
            primary
            fluid
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="spinner" loading />
                Creating campaign...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </Form>
      </Segment>
    </Layout>
  );
};

export default CampaignsNew;
