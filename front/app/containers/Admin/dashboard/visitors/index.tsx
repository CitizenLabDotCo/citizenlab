import React from 'react';

import moment from 'moment';

import { START_DATE_PAGEVIEW_AND_EXPANDED_SESSION_DATA_COLLECTION as LOWER_BOUND } from '../constants';

import VisitorsOverview from './VisitorsOverview';

const Visitors = () => {
  return <VisitorsOverview uniqueVisitorDataDate={moment(LOWER_BOUND)} />;
};

export default Visitors;
