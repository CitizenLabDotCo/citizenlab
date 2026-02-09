import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { transparentize } from 'polished';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { userTimezone } from 'utils/dateUtils';

import { getLocale } from '../../_shared/locales';
import { Props } from '../typings';

import { generateModifiers } from './utils/generateModifiers';
import { getEndMonth, getStartMonth } from './utils/getStartEndMonth';
import { getUpdatedRange } from './utils/getUpdatedRange';

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

  .rdp-range_middle > button {
    font-size: 14px;
  }

  .is-disabled-start {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 50% 0 0 50%;
  }

  .is-disabled-start > button {
    cursor: not-allowed;
  }

  .is-disabled-middle {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
  }

  .is-disabled-middle > button {
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

  .is-disabled-single {
    background: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 50%;
  }

  .is-disabled-single > button {
    cursor: not-allowed;
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

  .is-selected-single-day {
    background: var(--rdp-accent-color);
    color: ${colors.white};
    border-radius: 50%;
  }
`;

const modifiersClassNames = {
  isDisabledStart: 'is-disabled-start',
  isDisabledMiddle: 'is-disabled-middle',
  isDisabledEnd: 'is-disabled-end',
  isDisabledGradient_one: 'is-disabled-gradient_one',
  isDisabledGradient_two: 'is-disabled-gradient_two',
  isDisabledGradient_three: 'is-disabled-gradient_three',
  isDisabledSingle: 'is-disabled-single',
  isSelectedStart: 'rdp-range_start',
  isSelectedMiddle: 'rdp-range_middle',
  isSelectedEnd: 'rdp-range_end',
  isSelectedGradient_one: 'is-selected-gradient_one',
  isSelectedGradient_two: 'is-selected-gradient_two',
  isSelectedGradient_three: 'is-selected-gradient_three',
  isSelectedSingleDay: 'is-selected-single-day',
};

const Calendar = ({
  selectedRange,
  disabledRanges = [],
  startMonth: _startMonth,
  endMonth: _endMonth,
  defaultMonth,
  onUpdateRange,
  className,
}: Props) => {
  const startMonth = getStartMonth({
    startMonth: _startMonth,
    selectedRange,
    disabledRanges,
    defaultMonth,
  });

  const endMonth = getEndMonth({
    endMonth: _endMonth,
    selectedRange,
    disabledRanges,
    defaultMonth,
  });

  const locale = useLocale();

  const modifiers = useMemo(
    () =>
      generateModifiers({
        selectedRange,
        disabledRanges,
      }),
    [selectedRange, disabledRanges]
  );

  const handleDayClick: PropsBase['onDayClick'] = (
    day,
    { isDisabledStart, isDisabledMiddle, isDisabledEnd, isDisabledSingle }
  ) => {
    if (
      isDisabledStart ||
      isDisabledMiddle ||
      isDisabledEnd ||
      isDisabledSingle
    ) {
      return;
    }

    const updatedRange = getUpdatedRange({
      selectedRange,
      disabledRanges,
      clickedDate: day,
    });

    onUpdateRange(updatedRange);
  };

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown"
        fixedWeeks
        locale={getLocale(locale)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onDayClick={handleDayClick}
        // This NOOP and empty array are necessary because otherwise the
        // DayPicker will rely on its internal state to manage the selected
        // range rather than being controlled by our state.
        selected={[] as any}
        onSelect={NOOP}
        timeZone={userTimezone}
        className={className ?? ''}
      />
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default Calendar;
