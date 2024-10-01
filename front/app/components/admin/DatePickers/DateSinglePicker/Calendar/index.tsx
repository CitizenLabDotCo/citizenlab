import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker } from 'react-day-picker';
import styled from 'styled-components';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }
`;

interface Props {
  selectedDate: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const Calendar = ({ selectedDate, onChange }: Props) => {
  return (
    <DayPickerStyles>
      <DayPicker mode="single" selected={selectedDate} onSelect={onChange} />
    </DayPickerStyles>
  );
};

export default Calendar;
