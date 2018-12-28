import React from 'react';
import ReactDOM from 'react-dom';
import App from './common/components/App'
import store from './common/redux/store';
import { Provider } from 'react-redux';

const Main = () => (
  <Provider store={store}>
    <App />
  </Provider>
);


ReactDOM.render(<Main />, document.getElementById('root'));

