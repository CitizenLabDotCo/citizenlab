import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Manager from '../../_shared/Manager';
import Search from '../../_shared/Search';
import Status from '../../_shared/Status';
import { useParam, setParam } from '../utils';

const Filters = () => {
  const managerIds = useParam('managers') ?? [];
  const searchValue = useParam('search');
  const statuses = useParam('status') ?? [];

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Manager
          managerIds={managerIds}
          mr="8px"
          onChange={(value) => {
            setParam('managers', value);
          }}
        />
        <Status
          mr="8px"
          values={statuses}
          onChange={(publicationStatuses) => {
            setParam('status', publicationStatuses);
          }}
        />
      </Box>
      <Search
        value={searchValue}
        onChange={(search) => {
          setParam('search', search);
        }}
      />
    </Box>
  );
};

export default Filters;
