import React from 'react';

// components
import { Box, Text, TextProps } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';

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
  <Box>
    <Text color={colorName} fontSize="s" display="inline">
      {name}: {formatPercentage(percentage)}
    </Text>
    <Text ml="4px" color="textSecondary" fontSize="s" display="inline">
      ({number.toLocaleString('en-US')})
    </Text>
  </Box>
);

const CustomTooltip = ({ label, payload }: CustomTooltipProps) => {
  if (!payload || !label) return null;

  return (
    <TooltipOutline label={label}>
      {payload.map(({ name, dataKey, payload }) => {
        const {
          actualPercentage,
          actualNumber,
          referencePercentage,
          referenceNumber,
        } = payload;
        const colorName: TextProps['color'] =
          dataKey === 'actualPercentage' ? 'textPrimary' : 'teal';

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
    </TooltipOutline>
  );
};

const renderTooltip = (props) => (
  <Tooltip
    {...props}
    content={(props) => (
      <CustomTooltip label={props.label} payload={props.payload as any} />
    )}
  />
);

export default renderTooltip;
