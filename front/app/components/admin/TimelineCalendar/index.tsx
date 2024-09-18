import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import 'react-day-picker/style.css';
import { DayPicker, Matcher, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from './locales';
import { DateRange } from './typings';
import { getModifierStyles, getModifiers, newPhasesGetter } from './utils';

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
      return [...acc, modifiers[key]];
    }, [] as Matcher[]);
  }, [modifiers]);

  const modifiersStyles = useMemo(() => {
    return getModifierStyles(modifiers);
  }, [modifiers]);

  if (!selectedPhase) return null;

  const handleDayClick: PropsBase['onDayClick'] = (day) => {
    // NOTE: This function won't fire if the day is disabled, so we don't
    // need to check if the day is disabled / overlaps with another phase.
    const currentSelectionIsOneDayPhase =
      selectedPhase.from.getTime() === selectedPhase.to.getTime();

    const clickedDayIsBeforeSelectedPhase = day < selectedPhase.from;

    const getNewPhases = newPhasesGetter({ phases, selectedPhaseIndex });

    if (currentSelectionIsOneDayPhase && clickedDayIsBeforeSelectedPhase) {
      // If the user has currently selected a one-day phase and they click
      // on a day before that phase, we set the phase to be a one-day phase
      // on the clicked day.
      onUpdatePhases(getNewPhases({ from: day, to: day }));
      return;
    }

    if (currentSelectionIsOneDayPhase && !clickedDayIsBeforeSelectedPhase) {
      // First, we check if the user has clicked on the one-day phase. In this
      // case, we do nothing.
      if (day.getTime() === selectedPhase.from.getTime()) return;

      // Next, we check if there is a phase after the one-day phase. If there
      // is not, we can safely extend the one-day phase to the clicked day.
      const nextPhase: DateRange | undefined = phases[selectedPhaseIndex + 1];

      if (nextPhase === undefined) {
        onUpdatePhases(getNewPhases({ from: selectedPhase.from, to: day }));
        return;
      }

      // Then, if there is a next phase, we check if the clicked day is before
      // the  start of the next phase. If it is, we can safely extend the one-day
      // phase to a multiple-day phase.
      if (day < nextPhase.from) {
        onUpdatePhases(getNewPhases({ from: selectedPhase.from, to: day }));
        return;
      }

      // Finally, if the clicked day is after the start of the next phase, we
      // set it as a one-day phase on the clicked day.
      onUpdatePhases(getNewPhases({ from: day, to: day }));
      return;
    }

    // If the selection is already a multi-day phase, we simply reset
    // the phase to a one-day phase on the clicked day.
    onUpdatePhases(getNewPhases({ from: day, to: day }));
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
        onDayClick={handleDayClick}
        // This NOOP is necessary because otherwise the DayPicker
        // will rely on its internal state to manage the selected range,
        // rather than being controlled by our state.
        onSelect={NOOP}
      />
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default TimelineCalendar;
