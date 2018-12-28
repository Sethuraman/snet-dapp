import React from 'react';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import { Routes } from './Routes';
import { initialiseAccount, cancelAccountRefresh } from '../redux/accountActions';

class Landing extends React.Component {

  componentDidMount() {
    this.props.initialiseAccount();
  }

  componentWillUnmount() {
    this.props.cancelAccountRefresh();
  }

  render() {
    return (typeof web3 !== 'undefined') ?
      <Redirect to={Routes.sampleServices} /> :
      <Redirect to={Routes.providers} />;
  }
}

export default connect(
  () => ({}),
  (dispatch) => ({
    initialiseAccount: () => dispatch(initialiseAccount),
    cancelAccountRefresh: () => dispatch(cancelAccountRefresh),
  }))(Landing);
