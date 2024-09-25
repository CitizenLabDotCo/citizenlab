import React, { useState } from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

import ClickOutside from 'utils/containers/clickOutside';

import Input from './Input';
import { DateRange } from './typings';

interface Props {
  selectedRange: Partial<DateRange>;
}

const DateRangePicker = ({ selectedRange }: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <ClickOutside onClickOutside={() => setCalendarOpen(false)}>
      <Tooltip content={'Test'} placement="bottom" visible={calendarOpen}>
        <Input
          selectedRange={selectedRange}
          onClick={() => setCalendarOpen((open) => !open)}
        />
      </Tooltip>
    </ClickOutside>
  );
};

export default DateRangePicker;
