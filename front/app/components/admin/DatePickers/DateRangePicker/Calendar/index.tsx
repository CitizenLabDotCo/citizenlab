import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from '../../_shared/locales';
import { Props } from '../typings';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }

  .rdp-selected > button.rdp-day_button {
    font-size: 14px;
    font-weight: normal;
  }
`;

const Calendar = ({ selectedRange, onUpdateRange }: Props) => {
  const locale = useLocale();

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown"
        locale={getLocale(locale)}
        selected={{ from: selectedRange.from, to: selectedRange.to }}
        onSelect={(newRange) => {
          onUpdateRange(newRange ?? {});
        }}
      />
    </DayPickerStyles>
  );
};

export default Calendar;
