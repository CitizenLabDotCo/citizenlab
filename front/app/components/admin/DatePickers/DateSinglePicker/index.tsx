import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';

import Calendar from './Calendar';
import Input from './Input';
import { Props } from './typings';

const WIDTH = '310px';

const DateSinglePicker = ({
  id,
  disabled,
  selectedDate,
  startMonth,
  endMonth,
  defaultMonth,
  onChange,
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
              selectedDate={selectedDate}
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={defaultMonth}
              onChange={(date) => {
                // We don't allow deselecting dates
                if (!date) return;
                onChange(date);
              }}
            />
          </Box>
        }
        placement="bottom"
        visible={calendarOpen}
      >
        <Input
          id={id}
          disabled={disabled}
          selectedDate={selectedDate}
          onClick={() => setCalendarOpen(true)}
        />
      </Tooltip>
    </ClickOutsideContainer>
  );
};

export default DateSinglePicker;
