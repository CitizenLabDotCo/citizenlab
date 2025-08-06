import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

const toDate = (str?: string) => {
  if (!str) return;
  return parseBackendDateString(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

const Dates = () => {
  const { formatMessage } = useIntl();

  const fromStr = useParam('min_start_date');
  const toStr = useParam('max_start_date');

  return (
    <Box display="flex" alignItems="center">
      <DateRangePicker
        selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
        onUpdateRange={({ from: fromDate, to: toDate }) => {
          const from = toString(fromDate);
          const to = toString(toDate);

          setParam('min_start_date', from);
          setParam('max_start_date', to);
          trackEventByName(tracks.setDates, { from, to });
        }}
      />
      <IconTooltip
        content={formatMessage(messages.projectStartDate)}
        placement="top"
        ml="4px"
      />
    </Box>
  );
};

export default Dates;
