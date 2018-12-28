import Web3 from 'web3';
import Eth from 'ethjs';

export const INITIALISE_ACCOUNT_ACTION = 'Common/INITIALISE_ACCOUNT_ACTION';
export const ACCOUNT_LOCKED_ACTION = 'Common/ACCOUNT_LOCKED_ACTION';
export const ACCOUNT_OBTAINED_ACTION = 'Common/ACCOUNT_OBTAINED_ACTION';
export const UPDATE_BALANCE_ACTION = 'Common/UPDATE_BALANCE_ACTION';

let watchWalletTimer = undefined;

export const initialiseAccount = async (dispatch, getState) => {
  if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    try {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      window.ethjs = new Eth(window.web3.currentProvider);
      //TODO: change the time back to 500 ms
      watchWalletTimer = setInterval(() => watchWallet(dispatch, getState), 50000);
    } catch (error) {
      console.log("User denied access to Metamask");
    }
  }
};

async function watchWallet(dispatch, getState) {
  let accountData = getState().accountData;
  try {
    const accounts = await window.ethjs.accounts();
    if (accounts.length === 0) {
      console.log('wallet is locked');
      dispatch({ type: ACCOUNT_LOCKED_ACTION});
      return;
    } else if (accounts[0] !== accountData.account) {
      window.web3.eth.defaultAccount = accounts[0];
      console.log('account: ' + accounts[0] + ' unlocked');
      dispatch({ type: ACCOUNT_OBTAINED_ACTION, payload: { account: accounts[0] } });
    }

    const balance = await window.ethjs.getBalance(accounts[0]);
    if (balance !== accountData.ethBalance) {
      console.log('account eth balance is: ' + Eth.fromWei(balance.toString(), 'ether'));
      dispatch({ type: UPDATE_BALANCE_ACTION, payload: { ethBalance: balance } });
    }
  } catch(err) {
    console.log(err)
  }
}

export const cancelAccountRefresh = () => {
  if(watchWalletTimer) {
    clearInterval(watchWalletTimer);
  }
};

