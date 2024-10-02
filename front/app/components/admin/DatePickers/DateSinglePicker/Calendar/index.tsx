import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from '../../_shared/locales';
import { CalendarProps } from '../typings';

import { getEndMonth, getStartMonth } from './utils/getStartEndMonth';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
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
  onChange,
}: CalendarProps) => {
  const locale = useLocale();

  const startMonth = getStartMonth({ startMonth: _startMonth, selectedDate });
  const endMonth = getEndMonth({ endMonth: _endMonth, selectedDate });

  return (
    <DayPickerStyles>
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        locale={getLocale(locale)}
        startMonth={startMonth}
        endMonth={endMonth}
        selected={selectedDate}
        onSelect={onChange}
      />
    </DayPickerStyles>
  );
};

export default Calendar;
