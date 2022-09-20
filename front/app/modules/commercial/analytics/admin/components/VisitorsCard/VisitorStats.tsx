import React from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// utils
import { isNilOrError } from 'utils/helperUtils';

const VisitorStats = () => {
  const { stats } = useVisitorsData();
  if (isNilOrError(stats)) return null;

  return (
    <Box>
      <Statistic name={'Test'} value={1000} bottomLabel={'blabla'} />
    </Box>
  );
};

export default VisitorStats;
