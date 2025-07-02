import React from 'react';

import { Box, Button, colors, Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { TimeRangeOption } from '../utils';

import messages from './messages';

type TimeRangeSelectorProps = {
  selectedRange: TimeRangeOption;
  onRangeChange: (range: TimeRangeOption) => void;
  onTodayClick: () => void;
};

export const TimeRangeSelector = ({
  selectedRange,
  onRangeChange,
  onTodayClick,
}: TimeRangeSelectorProps) => {
  const { formatMessage } = useIntl();

  const timeRangeOptions: { value: TimeRangeOption; label: string }[] = [
    { value: 'month', label: formatMessage(messages.timeRangeMonth) },
    { value: 'quarter', label: formatMessage(messages.timeRangeQuarter) },
    { value: 'year', label: formatMessage(messages.timeRangeYear) },
    { value: 'multiyear', label: formatMessage(messages.timeRangeMultiyear) },
  ];

  return (
    <Box
      display="flex"
      gap="8px"
      alignItems="center"
      position="sticky"
      right="16px"
      top="0"
      zIndex="4"
      bg={colors.white}
      p="8px"
    >
      <Box width="140px">
        <Select
          value={selectedRange}
          onChange={(option) => onRangeChange(option.value)}
          options={timeRangeOptions}
        />
      </Box>
      <Button onClick={onTodayClick} buttonStyle="secondary" size="s">
        {formatMessage(messages.today)}
      </Button>
    </Box>
  );
};

export default TimeRangeSelector;
