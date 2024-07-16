import React from 'react';

import {
  Box,
  Text,
  IconTooltip,
  Color,
} from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  tooltipContent?: React.ReactChild;
  nameColor?: Color;
}

const StatisticName = ({ name, nameColor, tooltipContent }: Props) => {
  return (
    <Box display="flex" alignItems="center">
      <Text
        color={nameColor}
        fontSize="s"
        mt="0px"
        mb="0px"
        display="inline"
        textAlign="left"
      >
        {name}
      </Text>
      {tooltipContent && (
        <Box ml="5px" display="inline">
          <IconTooltip
            content={tooltipContent}
            theme="light"
            transform="translate(0,-2)"
            display="inline"
          />
        </Box>
      )}
    </Box>
  );
};

export default StatisticName;
