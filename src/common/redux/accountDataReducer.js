import {
  ACCOUNT_LOCKED_ACTION,
  ACCOUNT_OBTAINED_ACTION,
  INITIALISE_ACCOUNT_ACTION,
  UPDATE_BALANCE_ACTION
} from './accountActions';

export const initialState = {
  account: undefined,
  ethBalance: undefined,
};


export default (state = initialState, action) => {
  switch (action.type) {
    case INITIALISE_ACCOUNT_ACTION:
      return state;
    case ACCOUNT_OBTAINED_ACTION:
      return {...state, account: action.payload.account, ethBalance: undefined};
    case ACCOUNT_LOCKED_ACTION:
      return {...initialState};
    case UPDATE_BALANCE_ACTION:
      return {...state, ethBalance: action.payload.ethBalance};
    default:
      return state;
  }
}

