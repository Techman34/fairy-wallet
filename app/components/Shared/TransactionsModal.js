import React, { Component } from 'react';
import {
  Modal,
  Transition,
  Button,
  Icon,
  Image,
  Header
} from 'semantic-ui-react';
import _ from 'lodash';
import TransferContext from './TransferContext';
import DelegateContext from './DelegateContext';
import VoteContext from './VoteContext';
import confirmTransaction from '../../../resources/images/confirm-transaction.svg';

type Props = {
  open: boolean,
  transactions: {},
  handleClose: () => {}
};

const noop = () => {};

const actionDisplayName = {
  transfer: 'Transfer funds',
  delegatebw: 'Stake funds',
  undelegatebw: 'Unstake funds'
};

function renderTransaction(transaction) {
  const { context, receipt, err, constructed, signed } = transaction;
  const { action } = context;
  const actionName = actionDisplayName[action];

  let icon = 'circle notched';
  let statusText = constructed ? 'Ready to sign' : 'Preparing...';
  let loading = true;
  if (signed) {
    statusText = 'Sending...';
  }

  if (receipt !== null) {
    statusText = `Transaction id ${receipt.transaction_id}`;
    icon = 'check';
    loading = false;
  }

  if (err !== null) {
    let error = err;
    try {
      if (typeof error === 'string') {
        [error] = JSON.parse(err).error.details;
      }
      if (error.message) {
        error = error.message.trim();
      }
    } catch (e) {
      noop();
    }
    statusText = error;
    icon = 'cancel';
    loading = false;
  }

  let content = <TransferContext context={context} />;
  if (action === 'delegatebw' || action === 'undelegatebw') {
    content = <DelegateContext context={context} />;
  } else if (action === 'voteproducer') {
    content = <VoteContext context={context} />
  }

  const header = (
    <Header>
      <Header.Content>
        {actionName}
        <Header.Subheader>
          <Icon name={icon} loading={loading} />
          {statusText}
        </Header.Subheader>
      </Header.Content>
    </Header>
  );

  return (
    <div key={action}>
      {header}
      {content}
    </div>
  );
}

class TransactionsModal extends Component<Props> {
  state = { activeIndex: 0 };

  handleClick = (e, { index }) => {
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { open, transactions, handleClose } = this.props;

    const renderedTxs = [];
    let successCounter = 0;
    let failureCounter = 0;
    Object.keys(transactions).forEach(key => {
      const tx = transactions[key];
      if (tx.context !== null) {
        renderedTxs.push(renderTransaction(tx));
      }
      successCounter += tx.receipt !== null ? 1 : 0;
      failureCounter += tx.err !== null ? 1 : 0;
    });

    let header = 'Use your device to verify transaction';
    let modalAction = '';
    if (successCounter === renderedTxs.length) {
      header = 'Success';
      modalAction = <Button onClick={handleClose} content="Close" />;
    } else if (failureCounter > 0) {
      header = 'Error';
      modalAction = <Button onClick={handleClose} content="Close" />;
    }

    return (
      <Transition visible={open} animation="scale" duration={500}>
        <Modal
          open={open}
          size="small"
          onClose={this.onClose}
          style={{ textAlign: 'center' }}
        >
          <Modal.Header>{header}</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Image
                src={confirmTransaction}
                centered
                style={{ marginTop: '1em', marginBottom: '1em' }}
              />
              {_.map(renderedTxs, tx => tx)}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>{modalAction}</Modal.Actions>
        </Modal>
      </Transition>
    );
  }
}

export default TransactionsModal;
