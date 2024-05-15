import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

const getDeltaColor = (delta: number) => {
  if (delta === 0) return 'grey700';
  if (delta > 0) return 'green500';
  return 'red500';
};

const getDeltaSymbol = (delta: number) => {
  if (delta === 0) return '+';
  if (delta > 0) return '+';
  return ''; // negative numbers already display a minus sign
};

interface Props {
  delta: number;
  deltaType?: 'percentage' | 'absolute';
}

const StatisticDelta = ({ delta, deltaType = 'absolute' }: Props) => {
  return (
    <Text
      color={getDeltaColor(delta)}
      fontSize="l"
      fontWeight="bold"
      display="inline"
      ml="8px"
      className="e2e-statistic-delta"
    >
      {getDeltaSymbol(delta)}
      {deltaType === 'percentage' ? `${delta}%` : delta}
    </Text>
  );
};

export default StatisticDelta;
