import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from '../../_shared/locales';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }

  .rdp-selected > button.rdp-day_button {
    background-color: ${colors.teal700};
    color: ${colors.white};
    font-size: 14px;
    font-weight: normal;
  }
`;

interface Props {
  selectedDate: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const Calendar = ({ selectedDate, onChange }: Props) => {
  const locale = useLocale();

  return (
    <DayPickerStyles>
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        locale={getLocale(locale)}
        selected={selectedDate}
        onSelect={onChange}
      />
    </DayPickerStyles>
  );
};

export default Calendar;
