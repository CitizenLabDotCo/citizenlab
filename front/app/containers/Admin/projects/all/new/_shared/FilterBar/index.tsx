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
      flexDirection="column"
      justifyContent="flex-end"
      gap="16px"
    >
      <Search placeholder={formatMessage(messages.search)} />
      <Sort />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;
