import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ClickOutside from 'utils/containers/clickOutside';

import Calendar from './Calendar';
import Input from './Input';
import { Props } from './typings';

const WIDTH = '310px';

const StyledClickOutside = styled(ClickOutside)`
  div.tippy-box {
    max-width: ${WIDTH} !important;
    padding: 8px;
  }
`;

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
    <StyledClickOutside onClickOutside={() => setCalendarOpen(false)}>
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
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    </StyledClickOutside>
  );
};

export default DateSinglePicker;
