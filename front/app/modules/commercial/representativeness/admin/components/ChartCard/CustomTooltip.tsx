import React from 'react';

// components
import { Box, Text, TextProps } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage } from './utils';

// typings
import { RepresentativenessRow } from '../../hooks/createRefDataSubscription';

interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    dataKey: string;
    payload: RepresentativenessRow;
    color: string;
    fill: string;
  }[];
}

interface RowProps {
  name: string;
  percentage: number;
  number: number;
  colorName: TextProps['color'];
}

const Row = ({ name, percentage, number, colorName }: RowProps) => (
  <Box pb="8px">
    <Text color={colorName} fontSize="s" display="inline">
      {name}: {formatPercentage(percentage)}
    </Text>
    <Text ml="4px" color="secondaryText" fontSize="s" display="inline">
      ({number.toLocaleString('en-US')})
    </Text>
  </Box>
);

const CustomTooltip = ({ label, payload }: CustomTooltipProps) => {
  if (!payload) return null;

  return (
    <Box background="white" px="8px" border={`1px solid ${colors.separation}`}>
      <Text
        color="adminTextColor"
        fontWeight="bold"
        textAlign="center"
        fontSize="s"
        mb="8px"
      >
        {label}
      </Text>

      {payload.map(({ name, dataKey, payload }) => {
        const {
          actualPercentage,
          actualNumber,
          referencePercentage,
          referenceNumber,
        } = payload;
        const colorName: TextProps['color'] =
          dataKey === 'actualPercentage' ? 'adminTextColor' : 'clBlue';

        return dataKey === 'actualPercentage' ? (
          <Row
            name={name}
            percentage={actualPercentage}
            number={actualNumber}
            colorName={colorName}
            key={dataKey}
          />
        ) : (
          <Row
            name={name}
            percentage={referencePercentage}
            number={referenceNumber}
            colorName={colorName}
            key={dataKey}
          />
        );
      })}
    </Box>
  );
};

export default CustomTooltip;
