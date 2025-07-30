import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import Search from './Filters/Search';
import Sort from './Filters/Sort';
import messages from './messages';

const Filters = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="8px"
      alignItems="center"
    >
      <Search placeholder={formatMessage(messages.search)} />
      <Sort />
      <Dates />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;
