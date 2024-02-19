import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Bar from './Bar';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { roundPercentages, sum } from 'utils/math';
import { round } from 'lodash-es';

interface Props {
  values: number[];
  total: number;
  colorScheme: string[];
  label: string;
}

const getType = (index: number, length: number) => {
  if (length === 1) return 'single';
  if (index === 0) return 'first';
  if (index === length - 1) return 'last';

  return 'middle';
};

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

const noZeroes = (number: number) => number !== 0;

const ProgressBars2 = ({ values, total, label, colorScheme }: Props) => {
  const { formatMessage } = useIntl();
  const percentages = getRoundedPercentages(values, total);
  const percentage = round(sum(percentages), 1);
  const nonZeroPercentages = percentages.filter(noZeroes);

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
      {percentages.length === 1 && percentages[0] === 0 && (
        <Bar percentage={0} />
      )}

      {nonZeroPercentages.map((percentage, index) => {
        const type = getType(index, nonZeroPercentages.length);

        console.log({ type });

        return (
          <Bar
            key={index}
            type={type}
            percentage={percentage}
            color={colorScheme[index % colorScheme.length]}
          />
        );
      })}
    </Box>
  );
};

export default ProgressBars2;
