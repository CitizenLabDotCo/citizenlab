import React from 'react';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import styled from 'styled-components';
import { colors } from '@citizenlab/cl2-component-library';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-background-color: ${colors.teal100};
  }
`;

const TimelineCalendar = () => {
  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        selected={{
          from: new Date(2024, 8, 1),
          to: new Date(2024, 8, 5),
        }}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
