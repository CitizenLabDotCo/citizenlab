import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';

import BoInput from './BoInput';
import Calendar from './Calendar';
import Input from './Input';
import { isSelectedRangeOpenEnded } from './isSelectedRangeOpenEnded';
import { Props } from './typings';

const WIDTH = '620px';

const DatePhasePicker = ({
  selectedRange,
  disabledRanges = [],
  startMonth,
  endMonth,
  defaultMonth,
  onUpdateRange,
  className,
  variant = 'default',
}: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const toggleCalendar = () => setCalendarOpen((open) => !open);

  const selectedRangeIsOpenEnded = isSelectedRangeOpenEnded(
    selectedRange,
    disabledRanges
  );

  return (
    <ClickOutsideContainer
      width={WIDTH}
      onClickOutside={() => setCalendarOpen(false)}
    >
      <Tooltip
        className={`${className}-date-picker`}
        content={
          <Box width={WIDTH}>
            <Calendar
              selectedRange={selectedRange}
              disabledRanges={disabledRanges}
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={defaultMonth}
              onUpdateRange={onUpdateRange}
            />
          </Box>
        }
        placement="bottom"
        popperOptions={{ strategy: 'fixed' }}
        visible={calendarOpen}
        width="1200px"
      >
        {variant === 'bo' ? (
          <BoInput
            selectedRange={selectedRange}
            selectedRangeIsOpenEnded={selectedRangeIsOpenEnded}
            calendarOpen={calendarOpen}
            onClick={toggleCalendar}
            className={className}
          />
        ) : (
          <Input
            selectedRange={selectedRange}
            selectedRangeIsOpenEnded={selectedRangeIsOpenEnded}
            onClick={toggleCalendar}
            className={className}
          />
        )}
      </Tooltip>
    </ClickOutsideContainer>
  );
};

export default DatePhasePicker;
