import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { FormattedMessage } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import { useParam, setParam } from '../utils';

import messages from './messages';

const StyledLabel = styled(Label)`
  flex-direction: column;
`;

const toDate = (str?: string) => {
  if (!str) return;
  return parseBackendDateString(str);
};

const toString = (date?: Date) => {
  if (!date) return;
  return format(date, 'yyyy-MM-dd');
};

const Dates = () => {
  const fromStr = useParam('min_start_date');
  const toStr = useParam('max_start_date');

  return (
    <StyledLabel>
      <FormattedMessage {...messages.projectStartDate} />
      <DateRangePicker
        selectedRange={{ from: toDate(fromStr), to: toDate(toStr) }}
        onUpdateRange={({ from: fromDate, to: toDate }) => {
          const from = toString(fromDate);
          const to = toString(toDate);

          setParam('min_start_date', from);
          setParam('max_start_date', to);
        }}
      />
    </StyledLabel>
  );
};

export default Dates;
