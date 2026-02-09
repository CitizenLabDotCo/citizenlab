import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { userTimezone } from 'utils/dateUtils';

import { getEndMonth } from '../../_shared/getStartEndMonth';
import { getLocale } from '../../_shared/locales';
import { CalendarProps } from '../typings';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};

    .rdp-dropdown_root:has(> select:focus-visible) {
      border: 2px solid ${colors.black};
      border-radius: 4px;
    }
  }

  .rdp-selected > button.rdp-day_button {
    background-color: ${colors.teal700};
    color: ${colors.white};
    font-size: 14px;
    font-weight: normal;
  }
`;

const Calendar = ({
  selectedDate,
  startMonth: _startMonth,
  endMonth: _endMonth,
  defaultMonth,
  onChange,
}: CalendarProps) => {
  const locale = useLocale();
  const startMonth = _startMonth ?? new Date(1900, 0);
  const endMonth = getEndMonth({ endMonth: _endMonth, selectedDate });

  return (
    <DayPickerStyles>
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        fixedWeeks
        locale={getLocale(locale)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth ?? selectedDate}
        selected={selectedDate}
        onSelect={onChange}
        timeZone={userTimezone}
      />
    </DayPickerStyles>
  );
};

export default Calendar;
