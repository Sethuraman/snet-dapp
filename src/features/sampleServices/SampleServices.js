import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import News from './News';

const SampleServices = () => (
  <React.Fragment>
    <News />
  </React.Fragment>
);

export default withStyles(styles)(SampleServices);