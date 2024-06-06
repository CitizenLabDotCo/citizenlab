import React from 'react';

import { Color, Text } from '@citizenlab/cl2-component-library';

export type Sign = 'positive' | 'negative' | 'zero';

export const getSignNumber = (delta: number) => {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'zero';
};

const COLOR_MAP: Record<Sign, Color> = {
  positive: 'green500',
  negative: 'red500',
  zero: 'grey700',
};

const SYMBOL_MAP: Record<Sign, string> = {
  positive: '+',
  negative: '', // negative numbers already display a minus sign
  zero: '+',
};

interface Props {
  delta: number | string;
  sign: Sign;
  deltaType?: 'percentage' | 'absolute';
}

const StatisticDelta = ({ delta, sign, deltaType = 'absolute' }: Props) => {
  return (
    <Text
      color={COLOR_MAP[sign]}
      fontSize="l"
      fontWeight="bold"
      display="inline"
      ml="8px"
      className="e2e-statistic-delta"
    >
      {SYMBOL_MAP[sign]}
      {deltaType === 'percentage' ? `${delta}%` : delta}
    </Text>
  );
};

export default StatisticDelta;
