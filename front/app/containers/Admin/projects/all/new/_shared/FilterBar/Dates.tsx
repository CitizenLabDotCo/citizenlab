import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import { useParam, setParam } from '../utils';

import messages from './messages';

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
    <Tooltip content={formatMessage(messages.projectStartDate)}>
      <DateRangePicker
        selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
        onUpdateRange={({ from: fromDate, to: toDate }) => {
          const from = toString(fromDate);
          const to = toString(toDate);

          setParam('min_start_date', from);
          setParam('max_start_date', to);
        }}
      />
    </Tooltip>
  );
};

export default Dates;
