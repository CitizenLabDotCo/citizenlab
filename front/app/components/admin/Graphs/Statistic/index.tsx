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
    <Text color="adminTextColor" fontSize="s" mt="0px" mb="0px">
      {name}
    </Text>
    <Text color="text" fontSize="xl" mt="2px" mb="0px">
      {value.toLocaleString()}
    </Text>
    {bottomLabel && (
      <Box mt="3px">
        <Text color="label" fontSize="s" mt="0px" mb="0px" display="inline">
          {bottomLabel}
        </Text>

        {bottomLabelValue && (
          <Text
            color="label"
            display="inline"
            fontWeight="bold"
            fontSize="s"
            mt="0px"
            mb="0px"
            ml="4px"
          >
            {bottomLabelValue}
          </Text>
        )}
      </Box>
    )}
  </Box>
);

export default Statistic;
