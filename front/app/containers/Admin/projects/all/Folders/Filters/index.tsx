import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Manager from '../../_shared/FilterBar/Filters/Manager';
import Spaces from '../../_shared/FilterBar/Filters/Spaces';
import Status from '../../_shared/FilterBar/Filters/Status';

const Filters = () => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

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
        {spacesEnabled && <Spaces mr="8px" />}
      </Box>
    </Box>
  );
};

export default Filters;
