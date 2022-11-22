import React from 'react';

// components
import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  value: string;
  bottomLabel?: string;
  bottomLabelValue?: string;
  tooltipContent?: React.ReactChild;
  textAlign?: 'left' | 'center';
}

const Statistic = ({
  name,
  value,
  bottomLabel,
  bottomLabelValue,
  tooltipContent,
  textAlign = 'left',
}: Props) => (
  <Box
    {...(textAlign === 'left'
      ? {}
      : { display: 'flex', flexDirection: 'column', alignItems: 'center' })}
  >
    <Box>
      <Text color="primary" fontSize="s" mt="0px" mb="0px" display="inline">
        {name}
      </Text>

      {tooltipContent && (
        <Box ml="8px" display="inline">
          <IconTooltip
            content={tooltipContent}
            theme="light"
            transform="translate(0,-2)"
            display="inline"
          />
        </Box>
      )}
    </Box>

    <Text color="textPrimary" fontSize="xl" mt="2px" mb="0px">
      {value}
    </Text>
    {bottomLabel && (
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
    )}
  </Box>
);

export default Statistic;
