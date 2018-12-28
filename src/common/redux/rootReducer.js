import {combineReducers} from 'redux';
import accountData from './accountDataReducer';

const rootReducer = combineReducers({
    accountData,
});

export default rootReducer;