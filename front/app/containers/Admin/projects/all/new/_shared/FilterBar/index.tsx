import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import PendingApproval from './Filters/PendingApproval';
import Sort from './Filters/Sort';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="8px"
      alignItems="center"
      className="intercom-product-tour-project-page-filters"
    >
      <Sort />
      <PendingApproval />
      <Dates />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;
