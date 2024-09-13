import React from 'react';

import { DayPicker } from 'react-day-picker';

import styled from 'styled-components';
import { colors } from '@citizenlab/cl2-component-library';

const DayPickerStyles = styled.div`
  td.rdp-day {
    margin: 0;
    padding: 0;
    text-align: center;
  }

  button.rdp-day_button {
    text-align: center;
    font-size: 14px;
    width: 36px;
    height: 36px;
  }

  td.rdp-range_start {
    background-color: ${colors.teal100};
    border-radius: 30px 0 0 30px;
  }

  td.rdp-range_start > button {
    background-color: ${colors.teal700};
    color: white;
    border-radius: 30px;
  }

  td.rdp-range_middle > button {
    background-color: ${colors.teal100};
  }

  td.rdp-range_end {
    background-color: ${colors.teal100};
    border-radius: 0 30px 30px 0;
  }

  td.rdp-range_end > button {
    background-color: ${colors.teal700};
    color: white;
    border-radius: 30px;
  }

  svg.rdp-chevron {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  svg.rdp-chevron:hover {
    fill: ${colors.teal700};
  }
`;

const TimelineCalendar = () => {
  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        selected={{
          from: new Date(2024, 8, 1),
          to: new Date(2024, 8, 5),
        }}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
