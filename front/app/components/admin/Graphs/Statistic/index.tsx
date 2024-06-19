import React from 'react';

import { Box, Text, Color } from '@citizenlab/cl2-component-library';

import StatisticBottomLabel from './StatisticBottomLabel';
import StatisticName from './StatisticName';

interface Props {
  name: string;
  value?: string | number;
  bottomLabel?: string;
  bottomLabelValue?: string;
  tooltipContent?: React.ReactChild;
  textAlign?: 'left' | 'center';
  nameColor?: Color;
}

const Statistic = ({
  name,
  value,
  bottomLabel,
  bottomLabelValue,
  tooltipContent,
  textAlign = 'left',
  nameColor = 'primary',
}: Props) => (
  <Box
    {...(textAlign === 'left'
      ? {}
      : { display: 'flex', flexDirection: 'column', alignItems: 'center' })}
  >
    <StatisticName
      name={name}
      nameColor={nameColor}
      tooltipContent={tooltipContent}
    />
    <Box mt="2px">
      <Text color="textPrimary" fontSize="xl" display="inline">
        {value}
      </Text>
    </Box>
    {bottomLabel && (
      <StatisticBottomLabel
        bottomLabel={bottomLabel}
        bottomLabelValue={bottomLabelValue}
      />
    )}
  </Box>
);

export default Statistic;
