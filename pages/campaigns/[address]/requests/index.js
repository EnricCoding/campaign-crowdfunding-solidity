import { useEffect, useState } from "react";
import Layout from "../../../../components/Layout/Layout";
import campaign from "../../../../ethereum/campaign";
import { Table, Button, Loader } from "semantic-ui-react";
import Link from "next/link";
import RequestRow from "../../../../components/RequestRow/RequestRow";
import styles from "./Requests.module.css";

const Requests = ({ address, requestsCount, approversCount }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    const camp = campaign(address);

    const requestsRaw = await Promise.all(
      Array(parseInt(requestsCount))
        .fill()
        .map((_, i) => camp.methods.requests(i).call())
    );

    const enriched = requestsRaw.map((req) => ({
      description: req.description,
      value: req.value.toString(),
      recipient: req.recipient,
      complete: req.complete,
      approvalCount: req.approvalCount.toString(),
      approversCount: approversCount.toString(),
    }));

    setRequests(enriched);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const renderRows = () => {
    return requests.map((request, index) => (
      <RequestRow
        key={index}
        request={request}
        index={index}
        address={address}
        onRefresh={loadRequests}
      />
    ));
  };

  return (
    <Layout>
      <div className={styles.header}>
        <h3>Requests</h3>

        <Link href={`/campaigns/${address}/requests/new`} passHref>
          <Button primary floated="right" className={styles.createButton}>
            Create New Request
          </Button>
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Amount (ether)</Table.HeaderCell>
              <Table.HeaderCell>Recipient</Table.HeaderCell>
              <Table.HeaderCell>Approval Count</Table.HeaderCell>
              <Table.HeaderCell>Approve</Table.HeaderCell>
              <Table.HeaderCell>Finalize</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan="7" className={styles.loadingCell}>
                  <Loader
                    active
                    inline="centered"
                    content="Loading requests..."
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              renderRows()
            )}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="7">
                Total requests: {requestsCount}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    </Layout>
  );
};

Requests.getInitialProps = async (props) => {
  const { address } = props.query;
  const camp = campaign(address);

  const requestsCount = await camp.methods.getRequestsCount().call();
  const approversCount = await camp.methods.approversCount().call();

  const requestsRaw = await Promise.all(
    Array(parseInt(requestsCount))
      .fill()
      .map((_, i) => camp.methods.requests(i).call())
  );

  const requests = requestsRaw.map((req) => ({
    description: req.description,
    value: req.value.toString(),
    recipient: req.recipient,
    complete: req.complete,
    approvalCount: req.approvalCount.toString(),
    approversCount: approversCount.toString(),
  }));

  return {
    address,
    requests,
    requestsCount: requestsCount.toString(),
    approversCount: approversCount.toString(),
  };
};

export default Requests;
