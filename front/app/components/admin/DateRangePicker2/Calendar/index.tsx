import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from './locales';
import { DateRange } from './typings';
import { getNextSelectedRange } from './utils';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }
`;

interface Props {
  selectedRange: DateRange;
  disabledRanges?: DateRange[];
  onUpdateRange: (range: DateRange) => void;
}

const Calendar = ({
  selectedRange,
  disabledRanges = [],
  onUpdateRange,
}: Props) => {
  const locale = useLocale();

  const handleDayClick: PropsBase['onDayClick'] = (day) => {
    const nextSelectedRage = getNextSelectedRange(
      day,
      selectedRange,
      disabledRanges
    );

    if (nextSelectedRage) {
      onUpdateRange(nextSelectedRage);
    }
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
