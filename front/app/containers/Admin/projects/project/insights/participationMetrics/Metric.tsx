import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import MetricTrendIndicator from './MetricTrendIndicator';

interface Props {
  label: string;
  value: number | string;
  change?: SevenDayChange;
}

const Metric = ({ label, value, change }: Props) => {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Box display="flex" flexDirection="column" gap="4px" w="130px">
      <Text fontSize="s" color="primary">
        {label}
      </Text>
      <Text fontSize="l" color="textPrimary">
        {formattedValue}
      </Text>
      {change !== undefined && <MetricTrendIndicator change={change} />}
    </Box>
  );
};

export default Metric;
