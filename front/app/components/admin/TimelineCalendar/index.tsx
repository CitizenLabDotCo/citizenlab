import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from './locales';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
  }
`;

const TimelineCalendar = () => {
  const locale = useLocale();

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown-months"
        locale={getLocale(locale)}
        selected={{
          from: new Date(2024, 8, 1),
          to: new Date(2024, 8, 5),
        }}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
