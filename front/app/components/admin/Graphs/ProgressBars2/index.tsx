import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Bar from './Bar';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { getRoundedPercentages, getType, noZeroes } from './utils';
import { sum } from 'utils/math';
import { round } from 'lodash-es';

interface Props {
  values: number[];
  total: number;
  colorScheme: string[];
  label: string;
}

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
      {nonZeroPercentages.length === 0 && <Bar percentage={0} />}

      {nonZeroPercentages.map((percentage, index) => {
        const type = getType(index, nonZeroPercentages.length);

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
