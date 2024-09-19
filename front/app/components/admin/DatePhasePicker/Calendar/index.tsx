import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { addYears } from 'date-fns';
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

  .is-disabled {
    background-color: ${colors.background};
    color: ${colors.coolGrey600};
  }

  .is-disabled > button {
    cursor: not-allowed;
  }

  .is-disabled-start {
    border-radius: 50% 0 0 50%;
  }

  .is-disabled-end {
    border-radius: 0 50% 50% 0;
  }
`;

interface Props {
  selectedRange: DateRange;
  disabledRanges?: DateRange[];
  startMonth?: Date;
  endMonth?: Date;
  onUpdateRange: (range: DateRange) => void;
}

const Calendar = ({
  selectedRange,
  disabledRanges = [],
  startMonth = addYears(new Date(), -2),
  endMonth = addYears(new Date(), 2),
  onUpdateRange,
}: Props) => {
  const locale = useLocale();

  const modifiers = useMemo(
    () => ({
      isDisabled: disabledRanges,
      isDisabledStart: disabledRanges.map((range) => range.from),
      isDisabledEnd: disabledRanges.map((range) => range.to),
    }),
    [disabledRanges]
  );

  const handleDayClick: PropsBase['onDayClick'] = (day, modifiers) => {
    if (modifiers.isDisabled) return;

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
        startMonth={startMonth}
        endMonth={endMonth}
        modifiers={modifiers}
        modifiersClassNames={{
          isDisabled: 'is-disabled',
          isDisabledStart: 'is-disabled-start',
          isDisabledEnd: 'is-disabled-end',
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
