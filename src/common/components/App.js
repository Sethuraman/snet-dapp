import React from 'react';
import Header from './Header';
import './BrowserReset.css';
import Router from './Routes';

export default class App extends React.Component {

  render() {
    return (
      <React.Fragment>
        <Header/>
        <Router/>
      </React.Fragment>
    );
  }

}
