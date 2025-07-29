import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import Manager from '../../_shared/FilterBar/Filters/Manager';
import Search from '../../_shared/FilterBar/Filters/Search';
import Status from '../../_shared/FilterBar/Filters/Status';

import messages from './messages';

const Filters = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Manager mr="8px" />
        <Status mr="8px" />
      </Box>
      <Search placeholder={formatMessage(messages.search)} />
    </Box>
  );
};

export default Filters;
