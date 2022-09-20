import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  value: number;
  bottomLabel?: string;
  bottomLabelValue?: string;
}

const Statistic = ({ name, value, bottomLabel, bottomLabelValue }: Props) => (
  <Box>
    <Text color="adminTextColor" fontSize="s">
      {name}
    </Text>
    <Text color="text" fontSize="xl">
      {value}
    </Text>
    {bottomLabel && (
      <Text color="label" fontSize="xs">
        {bottomLabel}

        {bottomLabelValue && (
          <Text display="inline" fontWeight="bold" fontSize="s">
            {bottomLabelValue}
          </Text>
        )}
      </Text>
    )}
  </Box>
);

export default Statistic;
