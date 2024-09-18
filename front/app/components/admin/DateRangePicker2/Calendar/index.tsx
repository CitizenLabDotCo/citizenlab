import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from './locales';
import { DateRange } from './typings';
import { getNextRange } from './utils';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }
`;

interface Props {
  selectedRange: DateRange;
  disabledRanges: DateRange[];
  onUpdateRange: (range: DateRange) => void;
}

const Calendar = ({ selectedRange, disabledRanges, onUpdateRange }: Props) => {
  const locale = useLocale();

  const handleDayClick: PropsBase['onDayClick'] = (day) => {
    // NOTE: This function won't fire if the day is disabled, so we don't
    // need to check if the day is disabled / overlaps with another range.
    const currentSelectionIsOneDayRange =
      selectedRange.from.getTime() === selectedRange.to.getTime();

    const clickedDayIsBeforeSelectedRange = day < selectedRange.from;

    if (currentSelectionIsOneDayRange && clickedDayIsBeforeSelectedRange) {
      // If the user has currently selected a one-day range and they click
      // on a day before that range, we set the range to be a one-day range
      // on the clicked day.
      onUpdateRange({ from: day, to: day });
      return;
    }

    if (currentSelectionIsOneDayRange && !clickedDayIsBeforeSelectedRange) {
      // First, we check if the user has clicked on the one-day range. In this
      // case, we do nothing.
      if (day.getTime() === selectedRange.from.getTime()) return;

      // Next, we check if there is a range after the one-day range. If there
      // is not, we can safely extend the one-day range to the clicked day.
      const nextRange = getNextRange(selectedRange, disabledRanges);

      if (nextRange === undefined) {
        onUpdateRange({ from: selectedRange.from, to: day });
        return;
      }

      // Then, if there is a next range, we check if the clicked day is before
      // the start of the next range. If it is, we can safely extend the one-day
      // range to a multiple-day range.
      if (day < nextRange.from) {
        onUpdateRange({ from: selectedRange.from, to: day });
        return;
      }

      // Finally, if the clicked day is after the start of the next range, we
      // set it as a one-day range on the clicked day.
      onUpdateRange({ from: day, to: day });
      return;
    }

    // If the selection is already a multi-day range, we simply reset
    // the range to a one-day range on the clicked day.
    onUpdateRange({ from: day, to: day });
  };

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown"
        locale={getLocale(locale)}
        selected={selectedRange}
        disabled={disabledRanges}
        modifiersStyles={{
          disabled: {
            backgroundColor: colors.background,
          },
        }}
        onDayClick={handleDayClick}
        // This NOOP is necessary because otherwise the DayPicker
        // will rely on its internal state to manage the selected range,
        // rather than being controlled by our state.
        onSelect={NOOP}
      />
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default Calendar;
