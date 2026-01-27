import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import MetricTrend from './MetricTrend';

interface Props {
  label: string;
  value: number | string;
  icon: IconNames;
  change?: SevenDayChange;
}

const MetricCard = ({ label, value, icon, change }: Props) => {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Box
      background={colors.white}
      border={`1px solid ${colors.grey100}`}
      borderRadius="8px"
      p="20px 24px 24px"
      w="200px"
      display="flex"
      flexDirection="column"
      gap="4px"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Text fontSize="s" color="coolGrey600" m="0">
          {label}
        </Text>
        <Icon name={icon} width="20px" height="20px" fill={colors.primary} />
      </Box>
      <Text
        as="span"
        color="primary"
        fontSize="xxxxl"
        fontWeight="bold"
        lineHeight="1.1"
        m="0"
        mt="8px"
        mb="4px"
      >
        {formattedValue}
      </Text>
      {change !== undefined && <MetricTrend change={change} />}
    </Box>
  );
};

export default MetricCard;
