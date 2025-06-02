import React, { useState } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import Campaign from "../../ethereum/campaign";
import web3 from "../../ethereum/web3";
import styles from "./ContributeForm.module.css";

const ContributeForm = ({ address, onContributionSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const campaign = Campaign(address);
      const [account] = await web3.eth.getAccounts();

      await campaign.methods.contribute().send({
        from: account,
        value: web3.utils.toWei(amount, "ether"),
      });

      setSuccessMessage("Contribution successful!");
      setAmount("");

      if (onContributionSuccess) {
        await onContributionSuccess();
      }
    } catch (err) {
      console.error("Error while contributing:", err);
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={!!errorMessage}
      success={!!successMessage}
      className={styles.form}
    >
      <Form.Field>
        <label htmlFor="contributionAmount">Contribution Amount</label>
        <Input
          id="contributionAmount"
          label="ether"
          labelPosition="right"
          placeholder="0.01"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
      </Form.Field>

      {errorMessage && <Message error header="Error" content={errorMessage} />}
      {successMessage && (
        <Message success header="Success" content={successMessage} />
      )}

      <Button
        primary
        fluid
        icon="send"
        content={loading ? "Sending..." : "Contribute"}
        loading={loading}
        disabled={loading}
      />
    </Form>
  );
};

export default ContributeForm;
