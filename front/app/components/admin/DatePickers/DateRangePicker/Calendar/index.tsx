import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker, PropsBase } from 'react-day-picker';
import 'react-day-picker/style.css';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getEndMonth } from '../../_shared/getStartEndMonth';
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

  const startMonth = _startMonth ?? new Date(1900, 0);
  const endMonth = getEndMonth({
    endMonth: _endMonth,
    selectedDate: selectedRange.to,
  });

  const handleDayClick: PropsBase['onDayClick'] = (day: Date) => {
    // If we have no date range yet,
    // OR we already have a fully set date range,
    // Set 'from' to the clicked day and remove 'to'.
    if (!selectedRange.from || selectedRange.to) {
      onUpdateRange({ from: day, to: undefined });
      return;
    }

    // If we clicked a day before the current 'from' date,
    // we set the 'from' date to the clicked day and remove 'to'.
    if (selectedRange.from > day) {
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
