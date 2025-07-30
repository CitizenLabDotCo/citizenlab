import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import DynamicFilters from './DynamicFilters';
import Search from './Filters/Search';
import Sort from './Filters/Sort';
import messages from './messages';

const Filters = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      flexDirection="row"
      gap="16px"
      height="52px"
      alignItems="center"
    >
      <Search placeholder={formatMessage(messages.search)} />
      <Sort />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;
