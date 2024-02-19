import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { roundPercentages, sum } from 'utils/math';

interface Props {
  values: number[];
  total: number;
  colorScheme: string[];
  label: string;
}

const getRoundedPercentages = (values: number[], total: number) => {
  const valuesSum = sum(values);
  const remainder = total - valuesSum;

  if (remainder < 0) {
    throw new Error('Total is smaller than the sum of the values');
  }

  const valuesWithRemainder = [...values, remainder];
  const roundedPercentages = roundPercentages(valuesWithRemainder, 1);

  return roundedPercentages.slice(0, values.length);
};

const BORDER = `1px solid ${colors.divider}`;

const ProgressBars2 = ({ values, total, label, colorScheme }: Props) => {
  const { formatMessage } = useIntl();
  const percentages = getRoundedPercentages(values, total);
  const percentage = sum(percentages);

  return (
    <Box width="100%">
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my="12px"
      >
        <Text variant="bodyM" m="0">
          {label}
        </Text>
        <Text variant="bodyS" color="textSecondary" m="0">
          {formatMessage(messages.choiceCount, {
            choiceCount: total,
            percentage,
          })}
        </Text>
      </Box>
      {percentages.map((percentage, index) => {
        const last = index === percentages.length - 1;

        return (
          <Box
            key={index}
            height="16px"
            width="100%"
            borderRadius="3px"
            border={BORDER}
            borderBottom={last ? BORDER : 'none'}
            overflow="hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={`${percentage}%`}
              height="25px"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect
                width="100"
                height="100"
                fill={colorScheme[index % colorScheme.length]}
              />
            </svg>
          </Box>
        );
      })}
    </Box>
  );
};

export default ProgressBars2;
