import React from 'react';

// components
import { Box, Text, TextProps } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage, formatThousands } from './utils';

// typings
import { RepresentativenessRow } from '.';

const StyledText = styled(Text)`
  display: inline;
  font-weight: 500;
`;

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
    <StyledText color={colorName} fontSize="s">
      {name}: {formatPercentage(percentage)}
    </StyledText>
    <StyledText ml="4px" color="secondaryText" fontSize="s">
      ({formatThousands(number)})
    </StyledText>
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
