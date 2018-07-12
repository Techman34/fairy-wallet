// @flow
import React, { Component } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as LedgerActions from '../../actions/ledger';

class PublicKeyContainer extends Component<Props> {

  retry = () => {
    this.props.getPublicKey();
  }

  render() {
    const {
      loading
    } = this.props;

    const noAccountsText = `Cannot retrieve Public Key. Make sure your device is unlocked.`;

    let disabled = false;
    if (loading.CREATE_CONNECTION) {
      disabled = true;
    }

    return (
      <Form>
        <Message
          content={noAccountsText}
        />
        <Button
          content="Retry"
          disabled={disabled}
          primary
          onClick={this.retry}
          style={{ marginTop: '1em' }}
        />
      </Form>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.loading
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
  ...LedgerActions
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PublicKeyContainer)