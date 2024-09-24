import React, { useState, useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { addYears } from 'date-fns';
import { transparentize } from 'polished';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { generateModifiers } from './generateModifiers';
import { getNextSelectedRange } from './getNextSelectedRange';
import { getLocale } from './locales';
import { DateRange } from './typings';

const disabledBackground = colors.grey300;
const disabledBackground2 = transparentize(0.33, disabledBackground);
const disabledBackground3 = transparentize(0.66, disabledBackground);

const selectedBackground = colors.teal100;
const selectedBackground2 = transparentize(0.33, selectedBackground);
const selectedBackground3 = transparentize(0.66, selectedBackground);

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${selectedBackground};
  }

  .is-disabled {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
  }

  .is-disabled > button {
    cursor: not-allowed;
  }

  .is-disabled-start {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 50% 0 0 50%;
  }

  .is-disabled-start > button {
    cursor: not-allowed;
  }

  .is-disabled-end {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 0 50% 50% 0;
  }

  .is-disabled-end > button {
    cursor: not-allowed;
  }

  .is-disabled-gradient_one {
    background: linear-gradient(
      90deg,
      ${disabledBackground},
      ${disabledBackground2}
    );
  }

  .is-disabled-gradient_one > button {
    cursor: not-allowed;
  }

  .is-disabled-gradient_two {
    background: linear-gradient(
      90deg,
      ${disabledBackground2},
      ${disabledBackground3}
    );
  }

  .is-disabled-gradient_three {
    background: linear-gradient(90deg, ${disabledBackground3}, ${colors.white});
  }

  .is-selected-gradient_one {
    background: linear-gradient(
      90deg,
      ${selectedBackground},
      ${selectedBackground2}
    );
  }

  .is-selected-gradient_two {
    background: linear-gradient(
      90deg,
      ${selectedBackground2},
      ${selectedBackground3}
    );
  }

  .is-selected-gradient_three {
    background: linear-gradient(90deg, ${selectedBackground3}, ${colors.white});
  }

  .is-currently-selected {
    background: var(--rdp-accent-color);
    color: ${colors.white};
    border-radius: 50%;
  }
`;

const modifiersClassNames = {
  isDisabled: 'is-disabled',
  isDisabledStart: 'is-disabled-start',
  isDisabledEnd: 'is-disabled-end',
  isDisabledGradient_one: 'is-disabled-gradient_one',
  isDisabledGradient_two: 'is-disabled-gradient_two',
  isDisabledGradient_three: 'is-disabled-gradient_three',
  isSelected: 'rdp-range_middle',
  isSelectedStart: 'rdp-range_start',
  isSelectedEnd: 'rdp-range_end',
  isSelectedGradient_one: 'is-selected-gradient_one',
  isSelectedGradient_two: 'is-selected-gradient_two',
  isSelectedGradient_three: 'is-selected-gradient_three',
  isCurrentlySelected: 'is-currently-selected',
};

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
  const [currentlySelectedDate, setCurrentSelectedDate] = useState<Date>();

  const modifiers = useMemo(
    () =>
      generateModifiers({
        previouslySelectedRange: selectedRange,
        disabledRanges,
        currentlySelectedDate,
      }),
    [selectedRange, disabledRanges, currentlySelectedDate]
  );

  const handleDayClick: PropsBase['onDayClick'] = (
    day,
    { isDisabled, isDisabledStart, isDisabledEnd, isDisabledGradient_one }
  ) => {
    if (
      isDisabled ||
      isDisabledStart ||
      isDisabledEnd ||
      isDisabledGradient_one
    )
      return;

    if (!currentlySelectedDate) {
      setCurrentSelectedDate(day);
      return;
    }

    if (day <= currentlySelectedDate) {
      setCurrentSelectedDate(day);
      return;
    }

    const nextSelectedRange = getNextSelectedRange({
      disabledRanges,
      currentlySelectedDate,
      lastClickedDate: day,
    });

    if (nextSelectedRange) {
      onUpdateRange(nextSelectedRange);
      setCurrentSelectedDate(undefined);
    }
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
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onDayClick={handleDayClick}
        // This NOOP and empty array are necessary because otherwise the
        // DayPicker will rely on its internal state to manage the selected
        // range rather than being controlled by our state.
        selected={[] as any}
        onSelect={NOOP}
      />
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default Calendar;
