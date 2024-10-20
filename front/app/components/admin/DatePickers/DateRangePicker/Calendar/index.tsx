import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker, PropsBase } from 'react-day-picker';
import 'react-day-picker/style.css';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getEndMonth, getStartMonth } from '../../_shared/getStartEndMonth';
import { getLocale } from '../../_shared/locales';
import { Props } from '../typings';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }

  .rdp-selected > button.rdp-day_button {
    font-size: 14px;
    font-weight: normal;
  }
`;

const Calendar = ({
  selectedRange,
  startMonth: _startMonth,
  endMonth: _endMonth,
  defaultMonth,
  disabled,
  onUpdateRange,
}: Props) => {
  const locale = useLocale();

  const startMonth = getStartMonth({
    startMonth: _startMonth,
    selectedDate: selectedRange.from,
  });

  const endMonth = getEndMonth({
    endMonth: _endMonth,
    selectedDate: selectedRange.to,
  });

  const handleDayClick: PropsBase['onDayClick'] = (day: Date) => {
    if (!selectedRange.from || selectedRange.to) {
      onUpdateRange({ from: day, to: undefined });
      return;
    }

    onUpdateRange({
      from: selectedRange.from,
      to: day,
    });
  };

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown"
        locale={getLocale(locale)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth}
        selected={{ from: selectedRange.from, to: selectedRange.to }}
        disabled={disabled}
        onDayClick={handleDayClick}
        // This NOOP is necessary because otherwise the
        // DayPicker will rely on its internal state to manage the selected
        // range rather than being controlled by our state.
        onSelect={NOOP}
      />
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default Calendar;
