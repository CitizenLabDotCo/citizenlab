import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker, Matcher, PropsRange } from 'react-day-picker';
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
  onUpdatePhases: (phases: DateRange[]) => void;
}

const TimelineCalendar = ({
  phases,
  selectedPhaseIndex,
  onUpdatePhases,
}: Props) => {
  const locale = useLocale();

  const selectedPhase = phases[selectedPhaseIndex];

  const modifiers = useMemo(() => {
    return getModifiers({ phases, selectedPhaseIndex });
  }, [phases, selectedPhaseIndex]);

  const disabled = useMemo(() => {
    return Object.keys(modifiers).reduce((acc, key) => {
      if (!key.startsWith('phase-')) return acc;

      return [...acc, modifiers[key]];
    }, [] as Matcher[]);
  }, [modifiers]);

  const modifiersStyles = useMemo(() => {
    return getModifierStyles(modifiers);
  }, [modifiers]);

  if (!selectedPhase) return null;

  const handleSelect: PropsRange['onSelect'] = (e) => {
    console.log(e);
  };

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown-months"
        locale={getLocale(locale)}
        selected={selectedPhase}
        disabled={disabled}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        onSelect={handleSelect}
      />
    </DayPickerStyles>
  );
};

export default TimelineCalendar;
