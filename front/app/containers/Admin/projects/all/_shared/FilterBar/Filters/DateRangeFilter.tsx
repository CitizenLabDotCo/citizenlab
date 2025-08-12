import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import messages from './messages';

const toDate = (str?: string) => {
  if (!str) return;
  return parseBackendDateString(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

interface DateRangeFilterProps {
  minStartDate?: string;
  maxStartDate?: string;
  onDateRangeChange: (from?: string, to?: string) => void;
  tooltipContent?: string;
}

const DateRangeFilter = ({
  minStartDate,
  maxStartDate,
  onDateRangeChange,
  tooltipContent,
}: DateRangeFilterProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" alignItems="center">
      <DateRangePicker
        selectedRange={{ from: toDate(minStartDate), to: toDate(maxStartDate) }}
        onUpdateRange={({ from: fromDate, to: toDate }) => {
          const from = toString(fromDate);
          const to = toString(toDate);

          onDateRangeChange(from, to);
        }}
      />
      <IconTooltip
        content={tooltipContent || formatMessage(messages.projectStartDate)}
        placement="top"
        ml="4px"
      />
    </Box>
  );
};

export default DateRangeFilter;
