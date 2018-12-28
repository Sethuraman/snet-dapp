import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Landing from './Landing';
import Providers from '../../features/providerSelection/Providers';
import SampleServices from '../../features/sampleServices/SampleServices';

export const Routes = {
  providers: '/providers',
  sampleServices: '/sampleServices',
}

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" component={Landing} exact />
      <Route path={Routes.providers} component={Providers} exact />
      <Route path={Routes.sampleServices} component={SampleServices} exact />
    </Switch>
  </BrowserRouter>
);

export default Router;