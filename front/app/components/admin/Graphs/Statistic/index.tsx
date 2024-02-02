import React from 'react';

// components
import {
  Box,
  Text,
  IconTooltip,
  Color,
} from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  value: string;
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
