import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';
import { DateRange } from '../_shared/typings';

import Input from './Input';

const WIDTH = '620px';

interface Props {
  selectedRange: Partial<DateRange>;
  startMonth?: Date;
  endMonth?: Date;
  onUpdateRange: (range: DateRange) => void;
}

const DateRangePicker = ({ selectedRange }: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <ClickOutsideContainer
      width={WIDTH}
      onClickOutside={() => setCalendarOpen(false)}
    >
      <Tooltip
        content={
          <Box width={WIDTH}>
            TEST
            {/* <Calendar
              selectedRange={selectedRange}
              disabledRanges={disabledRanges}
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={defaultMonth}
              onUpdateRange={onUpdateRange}
            /> */}
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
