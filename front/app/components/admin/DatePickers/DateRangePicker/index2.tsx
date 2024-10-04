import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';

import Calendar from './Calendar';
import Input from './Input';
import { Props } from './typings';

const WIDTH = '620px';

const DateRangePicker = ({
  selectedRange,
  startMonth,
  endMonth,
  onUpdateRange,
}: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <ClickOutsideContainer
      width={WIDTH}
      onClickOutside={() => setCalendarOpen(false)}
    >
      <Tooltip
        content={
          <Box width={WIDTH}>
            <Calendar
              selectedRange={selectedRange}
              startMonth={startMonth}
              endMonth={endMonth}
              // defaultMonth={defaultMonth}
              onUpdateRange={onUpdateRange}
            />
          </Box>
        }
        placement="bottom"
        visible={calendarOpen}
        width="1200px"
      >
        <Input
          selectedRange={selectedRange}
          onClick={() => setCalendarOpen((open) => !open)}
        />
      </Tooltip>
    </ClickOutsideContainer>
  );
};

export default DateRangePicker;
