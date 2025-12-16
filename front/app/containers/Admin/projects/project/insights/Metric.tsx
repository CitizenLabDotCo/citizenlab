import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import TrendIndicator from 'components/TrendIndicator';
import trendIndicatorMessages from 'components/TrendIndicator/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  label: string;
  value: number | string;
  change?: SevenDayChange;
}

const Metric = ({ label, value, change }: Props) => {
  const { formatMessage } = useIntl();
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
      {change !== undefined && (
        <TrendIndicator
          percentageDifference={change}
          comparisonLabel={formatMessage(trendIndicatorMessages.vsLast7Days)}
        />
      )}
    </Box>
  );
};

export default Metric;
