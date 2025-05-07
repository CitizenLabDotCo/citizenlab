import React from 'react';

import { Box, Text, Color } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import StatisticBottomLabel from './StatisticBottomLabel';
import StatisticName from './StatisticName';

interface Props {
  name: string;
  value?: string | number;
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
}: Props) => {
  const { formatNumber } = useIntl();

  // When value is a number, format according to the locale
  const formattedValue =
    typeof value === 'string' ? value : value && formatNumber(value);

  return (
    <Box
      {...(textAlign === 'left'
        ? {}
        : { display: 'flex', flexDirection: 'column', alignItems: 'center' })}
    >
      <StatisticName
        name={name}
        nameColor={nameColor}
        tooltipContent={tooltipContent}
      />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {formattedValue}
        </Text>
      </Box>
      {bottomLabel && (
        <StatisticBottomLabel
          bottomLabel={bottomLabel}
          bottomLabelValue={bottomLabelValue}
        />
      )}
    </Box>
  );
};

export default Statistic;
