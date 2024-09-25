import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ClickOutside from 'utils/containers/clickOutside';

import Calendar from './Calendar';
import Input from './Input';
import { DateRange } from './typings';

const StyledClickOutside = styled(ClickOutside)`
  div.tippy-box {
    max-width: 620px !important;
    padding: 8px;
  }
`;

interface Props {
  selectedRange: Partial<DateRange>;
  onUpdateRange: (range: DateRange) => void;
}

const DateRangePicker = ({ selectedRange, onUpdateRange }: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <StyledClickOutside onClickOutside={() => setCalendarOpen(false)}>
      <Tooltip
        content={
          <Box width="800px">
            <Calendar
              selectedRange={selectedRange}
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
    </StyledClickOutside>
  );
};

export default DateRangePicker;
