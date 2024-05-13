import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  bottomLabel: string;
  bottomLabelValue?: string;
}

const StatisticBottomLabel = ({ bottomLabel, bottomLabelValue }: Props) => {
  return (
    <Box mt="3px">
      <Text
        color="textSecondary"
        fontSize="s"
        mt="0px"
        mb="0px"
        display="inline"
      >
        {bottomLabel}
      </Text>

      {bottomLabelValue && (
        <Text
          color="textSecondary"
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
  );
};

export default StatisticBottomLabel;
