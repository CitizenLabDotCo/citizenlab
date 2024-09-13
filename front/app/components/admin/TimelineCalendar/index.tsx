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
    --rdp-accent-background-color: ${colors.teal100};
  }
`;

type DateRange = {
  from: Date;
  to: Date;
};

interface Props {
  phases: DateRange[];
  selectedPhaseIndex: number;
}

const TimelineCalendar = ({ phases, selectedPhaseIndex }: Props) => {
  const locale = useLocale();

  const selectedPhase = phases[selectedPhaseIndex];

  if (!selectedPhase) return null;

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown-months"
        locale={getLocale(locale)}
        selected={selectedPhase}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
