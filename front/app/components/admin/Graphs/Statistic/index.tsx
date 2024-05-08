import React from 'react';

import {
  Box,
  Text,
  IconTooltip,
  Color,
} from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  value: string;
  delta?: number;
  bottomLabel?: string;
  bottomLabelValue?: string;
  tooltipContent?: React.ReactChild;
  textAlign?: 'left' | 'center';
  nameColor?: Color;
}

const getDeltaColor = (delta: number) => {
  if (delta === 0) return 'textPrimary';
  if (delta > 0) return 'green500';
  return 'red500';
};

const getDeltaSymbol = (delta: number) => {
  if (delta === 0) return '';
  if (delta > 0) return '+';
  return '-';
};

const Statistic = ({
  name,
  value,
  delta,
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
    <Box mt="2px">
      <Text color="textPrimary" fontSize="xl" display="inline">
        {value}
      </Text>
      {delta !== undefined && (
        <Text
          color={getDeltaColor(delta)}
          fontSize="l"
          fontWeight="bold"
          display="inline"
          ml="8px"
        >
          {getDeltaSymbol(delta)}
          {delta}
        </Text>
      )}
    </Box>
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
