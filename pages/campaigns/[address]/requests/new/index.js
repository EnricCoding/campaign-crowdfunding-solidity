import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../../../../components/Layout/Layout";
import { Form, Button, Message, Segment, Header } from "semantic-ui-react";
import campaign from "../../../../../ethereum/campaign";
import web3 from "../../../../../ethereum/web3";

const RequestNew = ({ address }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setRecipient("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleError = (error) => {
    const message = error?.message || "An unexpected error occurred.";
    setErrorMessage(message);
  };

  const handleSuccess = () => {
    setSuccessMessage("Request created successfully!");
    resetForm();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const camp = campaign(address);
      const accounts = await web3.eth.getAccounts();
      await camp.methods
        .createRequest(
          description,
          web3.utils.toWei(amount, "ether"),
          recipient
        )
        .send({ from: accounts[0] });

      handleSuccess();
      router.push(`/campaigns/${address}/requests`);
    } catch (error) {
      console.error("Error creating request:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Segment padded="very" raised>
        <Link href={`/campaigns/${address}/requests`} passHref>
          <Button basic>&larr; Back to Requests</Button>
        </Link>

        <Header as="h2" textAlign="center">
          Create New Request
        </Header>

        <Form
          onSubmit={onSubmit}
          error={!!errorMessage}
          success={!!successMessage}
          loading={loading}
        >
          <Form.Input
            label="Description"
            placeholder="Enter request description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Form.Input
            label="Amount (Ether)"
            placeholder="0.1"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Form.Input
            label="Recipient Address"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />

          {errorMessage && (
            <Message error header="Error" content={errorMessage} />
          )}
          {successMessage && (
            <Message success header="Success" content={successMessage} />
          )}

          <Button
            type="submit"
            content={loading ? "Submitting..." : "Create Request"}
            icon="paper plane"
            primary
            fluid
            loading={loading}
            disabled={loading}
          />
        </Form>
      </Segment>
    </Layout>
  );
};

RequestNew.getInitialProps = async (props) => {
  return { address: props.query.address };
};

export default RequestNew;
