import React from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import { Box } from '@citizenlab/cl2-component-library';
import LineChart from 'components/admin/Graphs/LineChart';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Chart = () => {
  const { timeSeries } = useVisitorsData();
  if (isNilOrError(timeSeries)) return null;

  return (
    <Box flexGrow={1}>
      <LineChart
        data={timeSeries}
        mapping={{
          x: 'date',
          y: ['visitors', 'visits'],
        }}
        lines={{
          strokes: [colors.categorical01, colors.categorical03],
        }}
      />
    </Box>
  );
};

export default Chart;
