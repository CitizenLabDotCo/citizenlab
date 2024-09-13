import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from './locales';
import { DateRange } from './typings';
import { getModifierStyles, getModifiers } from './utils';

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${colors.teal100};
  }
`;

interface Props {
  phases: DateRange[];
  selectedPhaseIndex: number;
}

const TimelineCalendar = ({ phases, selectedPhaseIndex }: Props) => {
  const locale = useLocale();
  const selectedPhase = phases[selectedPhaseIndex];

  const modifiers = useMemo(() => {
    return getModifiers({ phases, selectedPhaseIndex });
  }, [phases, selectedPhaseIndex]);

  const modifiersStyles = useMemo(() => {
    return getModifierStyles(modifiers);
  }, [modifiers]);

  if (!selectedPhase) return null;

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown-months"
        locale={getLocale(locale)}
        selected={selectedPhase}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
