import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import Search from '../Search';
import { useParam, setParam } from '../utils';

import DynamicFilters from './DynamicFilters';
import messages from './messages';

const Filters = () => {
  const { formatMessage } = useIntl();
  const searchValue = useParam('search');

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      gap="16px"
    >
      <Box
        minWidth="300px"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Search
          value={searchValue}
          placeholder={formatMessage(messages.search)}
          onChange={(search) => {
            setParam('search', search);
          }}
        />
      </Box>

      <DynamicFilters />
    </Box>
  );
};

export default Filters;
