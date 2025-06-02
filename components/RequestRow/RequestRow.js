//import React, { useState } from "react";
//import { Table, Button, Message } from "semantic-ui-react";
//import web3 from "../../ethereum/web3";
//import campaign from "../../ethereum/campaign";//

//const RequestRow = ({ request, index, address, onRefresh }) => {
//  const [approving, setApproving] = useState(false);
//  const [finalizing, setFinalizing] = useState(false);
//  const [errorMessage, setErrorMessage] = useState("");
//  const [successMessage, setSuccessMessage] = useState("");//

//  const approvalCount = parseInt(request.approvalCount);
//  const approversCount = parseInt(request.approversCount);
//  const readyToFinalize = approvalCount > approversCount / 2;
//  const isComplete = request.complete;//

//  const handleApprove = async () => {
//    setApproving(true);
//    setErrorMessage("");
//    setSuccessMessage("");//

//    try {
//      const camp = campaign(address);
//      const accounts = await web3.eth.getAccounts();
//      await camp.methods.approveRequest(index).send({
//        from: accounts[0],
//      });//

//      setSuccessMessage("Solicitud aprobada correctamente.");//

//      if (onRefresh) await onRefresh();
//    } catch (err) {
//      setErrorMessage(err.message || "Error al aprobar la solicitud.");
//    }//

//    setApproving(false);
//  };//

//  const handleFinalize = async () => {
//    setFinalizing(true);
//    setErrorMessage("");
//    setSuccessMessage("");//

//    try {
//      console.log("approvalCount", approvalCount);
//      console.log("approversCount", approversCount);
//      console.log("readyToFinalize", readyToFinalize);
//      console.log("isComplete", isComplete);//

//      const camp = campaign(address);
//      const accounts = await web3.eth.getAccounts();//

//      await camp.methods.finalizeRequest(index).send({
//        from: accounts[0],
//      });//

//      setSuccessMessage("Solicitud finalizada correctamente.");//

//      if (onRefresh) await onRefresh();
//    } catch (err) {
//      console.error("Error al finalizar la solicitud:", err);
//      setErrorMessage(err.message || "Error al finalizar la solicitud.");
//    }//

//    setFinalizing(false);
//  };//

//  return (
//    <>
//      <Table.Row
//        disabled={isComplete}
//        positive={readyToFinalize && !isComplete}
//      >
//        <Table.Cell>{index}</Table.Cell>
//        <Table.Cell>{request.description}</Table.Cell>
//        <Table.Cell>{web3.utils.fromWei(request.value, "ether")}</Table.Cell>
//        <Table.Cell>{request.recipient}</Table.Cell>
//        <Table.Cell>
//          {approvalCount} / {approversCount}
//        </Table.Cell>
//        <Table.Cell>
//          <Button
//            color="green"
//            basic
//            size="small"
//            loading={approving}
//            disabled={isComplete || approving || readyToFinalize}
//            onClick={handleApprove}
//          >
//            Aprobar
//          </Button>
//        </Table.Cell>
//        <Table.Cell>
//          <Button
//            color="teal"
//            basic
//            size="small"
//            loading={finalizing}
//            disabled={!readyToFinalize || isComplete || finalizing}
//            onClick={handleFinalize}
//          >
//            Finalizar
//          </Button>
//        </Table.Cell>
//      </Table.Row>//

//      {(errorMessage || successMessage) && (
//        <Table.Row>
//          <Table.Cell colSpan="7">
//            <Message
//              error={!!errorMessage}
//              success={!!successMessage}
//              content={errorMessage || successMessage}
//            />
//          </Table.Cell>
//        </Table.Row>
//      )}
//    </>
//  );
//};//

//export default RequestRow;//

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Button, Message } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import campaign from "../../ethereum/campaign";

function RequestRow({ request, index, address, onRefresh }) {
  /* -------------------------------------------------- state */
  const [isApproving, setApproving] = useState(false);
  const [isFinalizing, setFinalizing] = useState(false);
  const [alert, setAlert] = useState({ type: null, text: "" });

  const approvalCount = Number(request.approvalCount);
  const approversCount = Number(request.approversCount);
  const readyToFinalize = approvalCount > approversCount / 2;
  const isComplete = request.complete;

  const showAlert = (type, text) => setAlert({ type, text });
  const clearAlert = () => setAlert({ type: null, text: "" });

  const handleApprove = async () => {
    clearAlert();
    setApproving(true);

    try {
      const camp = campaign(address);
      const [account] = await web3.eth.getAccounts();

      await camp.methods.approveRequest(index).send({ from: account });
      showAlert("success", "Request approved successfully.");

      await onRefresh?.();
    } catch (err) {
      showAlert("error", err?.message || "Failed to approve request.");
    }
    setApproving(false);
  };

  const handleFinalize = async () => {
    clearAlert();
    setFinalizing(true);

    try {
      const camp = campaign(address);
      const [account] = await web3.eth.getAccounts();

      await camp.methods.finalizeRequest(index).send({ from: account });
      showAlert("success", "Request finalized successfully.");

      await onRefresh?.();
    } catch (err) {
      showAlert("error", err?.message || "Failed to finalize request.");
    }
    setFinalizing(false);
  };

  return (
    <>
      <Table.Row
        disabled={isComplete}
        positive={readyToFinalize && !isComplete}
      >
        <Table.Cell>{index}</Table.Cell>
        <Table.Cell>{request.description}</Table.Cell>
        <Table.Cell>{web3.utils.fromWei(request.value, "ether")}</Table.Cell>
        <Table.Cell>{request.recipient}</Table.Cell>
        <Table.Cell>
          {approvalCount} / {approversCount}
        </Table.Cell>
        <Table.Cell>
          <Button
            basic
            color="green"
            size="small"
            loading={isApproving}
            disabled={isComplete || isApproving || readyToFinalize}
            onClick={handleApprove}
            content="Approve"
          />
        </Table.Cell>
        <Table.Cell>
          <Button
            basic
            color="teal"
            size="small"
            loading={isFinalizing}
            disabled={!readyToFinalize || isComplete || isFinalizing}
            onClick={handleFinalize}
            content="Finalize"
          />
        </Table.Cell>
      </Table.Row>

      {alert.text && (
        <Table.Row>
          <Table.Cell colSpan="7">
            <Message
              {...{ [alert.type]: true }}
              content={alert.text}
              onDismiss={clearAlert}
            />
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
}

RequestRow.propTypes = {
  request: PropTypes.shape({
    description: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    recipient: PropTypes.string.isRequired,
    approvalCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    approversCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    complete: PropTypes.bool.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default RequestRow;
