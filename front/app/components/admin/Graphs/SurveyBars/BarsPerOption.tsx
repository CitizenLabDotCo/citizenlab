import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { round } from 'lodash-es';

import { useIntl } from 'utils/cl-intl';
import { sum } from 'utils/math';

import Bar from './Bar';
import messages from './messages';
import { getRoundedPercentages, getType } from './utils';

interface Props {
  values: number[];
  total: number;
  colorScheme: string[];
  label: string;
}

const BarsPerOption = ({ values, total, label, colorScheme }: Props) => {
  const { formatMessage } = useIntl();
  const percentages = getRoundedPercentages(values, total);
  const valueSum = sum(values);
  const percentage = round(sum(percentages), 1);

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
            choiceCount: valueSum,
            percentage,
          })}
        </Text>
      </Box>
      {percentages.length === 0 && <Bar percentage={0} />}

      {percentages.map((percentage, index) => {
        const type = getType(index, percentages.length);

        return (
          <Bar
            key={index}
            type={type}
            percentage={percentage}
            color={colorScheme[index]}
          />
        );
      })}
    </Box>
  );
};

export default BarsPerOption;
