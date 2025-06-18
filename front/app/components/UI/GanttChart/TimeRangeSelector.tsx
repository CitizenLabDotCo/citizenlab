import React from 'react';

import { Box, Button, Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { TimeRangeOption } from './utils';

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
    { value: '5years', label: formatMessage(messages.timeRange5Years) },
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
      bg="#fff"
      p="8px"
    >
      <Box width="120px">
        <Select
          value={selectedRange}
          onChange={(option) => onRangeChange(option.value as TimeRangeOption)}
          options={timeRangeOptions}
        />
      </Box>
      <Button onClick={onTodayClick} buttonStyle="secondary" size="s">
        {formatMessage(messages.today)}
      </Button>
    </Box>
  );
};
