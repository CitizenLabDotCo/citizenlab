import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { addYears } from 'date-fns';
import { transparentize } from 'polished';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { generateModifiers } from './generateModifiers';
import { getLocale } from './locales';
import { DateRange } from './typings';
import { getNextSelectedRange } from './utils';

const disabledBackground = colors.grey300;
const background2 = transparentize(0.33, disabledBackground);
const background3 = transparentize(0.66, disabledBackground);

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
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

  .is-disabled-gradient_one {
    background: linear-gradient(90deg, ${disabledBackground}, ${background2});
  }

  .is-disabled-gradient_one > button {
    cursor: not-allowed;
  }

  .is-disabled-gradient_two {
    background: linear-gradient(90deg, ${background2}, ${background3});
  }

  .is-disabled-gradient_three {
    background: linear-gradient(90deg, ${background3}, ${colors.white});
  }
`;

const modifiersClassNames = {
  isDisabled: 'is-disabled',
  isDisabledStart: 'is-disabled-start',
  isDisabledEnd: 'is-disabled-end',
  isDisabledGradient: 'is-disabled-gradient',
  isSelected: 'rdp-range_middle',
  isSelectedStart: 'rdp-range_start',
  isSelectedEnd: 'rdp-range_end',
  isDisabledGradient_one: 'is-disabled-gradient_one',
  isDisabledGradient_two: 'is-disabled-gradient_two',
  isDisabledGradient_three: 'is-disabled-gradient_three',
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

  const modifiers = useMemo(
    () =>
      generateModifiers({
        previouslySelectedRange: selectedRange,
        disabledRanges,
      }),
    [selectedRange, disabledRanges]
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
        startMonth={startMonth}
        endMonth={endMonth}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
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
