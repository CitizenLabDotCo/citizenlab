import React from 'react';

import TopBar from '../../../components/TopBar';
import Categories from './Categories';

import { withRouter } from 'react-router';

const DetailsInsightsView = () => {
  return (
    <>
      <TopBar />
      <Categories />
    </>
  );
};

export default withRouter(DetailsInsightsView);
