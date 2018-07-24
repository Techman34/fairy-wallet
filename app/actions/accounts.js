// @flow
import _ from 'lodash';
import * as types from './types';
import eos from './helpers/eos';

export function getAccounts(publicKey) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_ACCOUNTS_REQUEST
    });

    const { connection } = getState();

    eos(connection)
      .getKeyAccounts(publicKey)
      .then(result =>
        dispatch({
          type: types.GET_ACCOUNTS_SUCCESS,
          accounts: result.account_names
        })
      )
      .catch(err =>
        dispatch({
          type: types.GET_ACCOUNTS_REQUEST,
          err
        })
      );
  };
}

export function setActiveAccount(index) {
  return (dispatch: () => void, getState) => {
    dispatch({ type: types.SET_ACTIVE_ACCOUNT, index });
    const { accounts } = getState();
    return dispatch(getAccount(accounts.names[index]));
  };
}

export function getAccount(name) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_ACCOUNT_REQUEST,
      name
    });
    const { connection } = getState();

    eos(connection)
      .getAccount(name)
      .then(result => {
        dispatch(getCurrencyBalance(name));
        dispatch(getActions(name));
        return dispatch({
          type: types.GET_ACCOUNT_SUCCESS,
          account: result
        });
      })
      .catch(err => {
        dispatch({
          type: types.GET_ACCOUNT_FAILURE,
          err
        });
      });
  };
}

export function getActions(name, position = -1, offset = -20) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_ACTIONS_REQUEST
    });

    const { connection, accounts } = getState();
    eos(connection)
      .getActions(name, position, offset)
      .then(result => {
        const { actions } = accounts;

        if (actions === null) {
          return dispatch({
            type: types.GET_ACTIONS_SUCCESS,
            actions: result.actions
          });
        }

        const history = _.unionBy(
          result.actions,
          actions,
          'account_action_seq'
        );

        return dispatch({
          type: types.GET_ACTIONS_SUCCESS,
          actions: _.sortBy(history, ['account_action_seq'])
        });
      })
      .catch(err => {
        dispatch({
          type: types.GET_ACTIONS_FAILURE,
          err: JSON.parse(err)
        });
      });
  };
}

export function getCurrencyBalance(account) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_CURRENCY_BALANCE_REQUEST
    });

    const { connection, settings } = getState();

    const { tokens } = settings;
    const selectedTokens = tokens[account];
    if (!selectedTokens) {
      return dispatch({
        type: types.GET_CURRENCY_BALANCE_SUCCESS,
        balances: {}
      });
    }

    const promisses = [];
    selectedTokens.forEach(symbol => {
      promisses.push(
        eos(connection).getCurrencyBalance('eosio.token', account, symbol)
      );
    });
    Promise.all(promisses)
      .then(values => {
        const pairs = _.map(_.flatten(values), value => {
          const valueKey = value.split(' ');
          return valueKey.reverse();
        });
        const balancesObject = _.fromPairs(pairs);
        return dispatch({
          type: types.GET_CURRENCY_BALANCE_SUCCESS,
          balances: balancesObject
        });
      })
      .catch(err => {
        dispatch({
          type: types.GET_CURRENCY_BALANCE_FAILURE,
          err: JSON.parse(err)
        });
      });
  };
}

export default {
  getAccounts,
  getAccount,
  getActions,
  getCurrencyBalance
};
