import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ClickOutside from 'utils/containers/clickOutside';

import Calendar from './Calendar';
import Input from './Input';
import { Props } from './typings';

const WIDTH = '620px';

const StyledClickOutside = styled(ClickOutside)`
  div.tippy-box {
    max-width: ${WIDTH} !important;
    padding: 8px;
  }
`;

const DateRangePicker = ({
  selectedRange,
  disabledRanges,
  startMonth,
  endMonth,
  onUpdateRange,
}: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <StyledClickOutside onClickOutside={() => setCalendarOpen(false)}>
      <Tooltip
        content={
          <Box width={WIDTH}>
            <Calendar
              selectedRange={selectedRange}
              disabledRanges={disabledRanges}
              startMonth={startMonth}
              endMonth={endMonth}
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
