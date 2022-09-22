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
import { toThreeLetterMonth } from 'utils/dateUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  resolution: IResolution;
}

const Chart = ({ resolution }: Props) => {
  const { timeSeries } = useVisitorsData();
  if (isNilOrError(timeSeries)) return null;

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  return (
    <Box flexGrow={1} pt="2px" pl="52px">
      <LineChart
        width="100%"
        height="100%"
        data={timeSeries}
        mapping={{
          x: 'date',
          y: ['visitors', 'visits'],
        }}
        lines={{
          strokes: [colors.categorical01, colors.categorical03],
        }}
        grid={{ vertical: true }}
        tooltip
        xaxis={{ tickFormatter: formatTick }}
      />
    </Box>
  );
};

export default Chart;
