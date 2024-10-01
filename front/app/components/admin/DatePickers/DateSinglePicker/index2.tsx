import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ClickOutside from 'utils/containers/clickOutside';

import Calendar from './Calendar';
import Input from './Input';

const WIDTH = '310px';

const StyledClickOutside = styled(ClickOutside)`
  div.tippy-box {
    max-width: ${WIDTH} !important;
    padding: 8px;
  }
`;

type Props = {
  id?: string;
  selectedDate: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
};

const DateSinglePicker = ({ selectedDate, onChange }: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <StyledClickOutside onClickOutside={() => setCalendarOpen(false)}>
      <Tooltip
        content={
          <Box width={WIDTH}>
            <Calendar selectedDate={selectedDate} onChange={onChange} />
          </Box>
        }
        placement="bottom"
        visible={calendarOpen}
      >
        <Input
          selectedDate={selectedDate}
          onClick={() => setCalendarOpen(true)}
        />
      </Tooltip>
    </StyledClickOutside>
  );
};

export default DateSinglePicker;
