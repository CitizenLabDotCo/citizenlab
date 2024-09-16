import { colors } from '@citizenlab/cl2-component-library';
import { rangeIncludesDate, Matcher } from 'react-day-picker';

import { DateRange } from './typings';

type GetModifiersParams = {
  phases: DateRange[];
  selectedPhaseIndex: number;
  tempFrom?: Date;
};

export const getModifiers = ({
  phases,
  selectedPhaseIndex,
  tempFrom,
}: GetModifiersParams): Record<string, Matcher> => {
  if (phases.length < 2) return {};

  return phases.reduce((acc, phase, index) => {
    if (index === selectedPhaseIndex) {
      // https://daypicker.dev/guides/custom-selections

      if (tempFrom) {
        return {
          ...acc,
          selected: tempFrom,
          range_start: tempFrom,
          range_end: false,
          range_middle: (_day: Date) => {
            return false;
          },
        };
      }

      return {
        ...acc,
        selected: phase,
        range_start: phase.from,
        range_end: phase.to,
        range_middle: (day: Date) => {
          return rangeIncludesDate(phase, day, true);
        },
      };
    }

    return {
      ...acc,
      [`phase-${index}`]: { from: phase.from, to: phase.to },
      [`phase-${index}-start`]: phase.from,
      [`phase-${index}-end`]: phase.to,
    };
  }, {} as Record<string, Matcher>);
};

export const getModifierStyles = (modifiers: Record<string, Matcher>) => {
  const modifiersStyles = {};

  for (const key in modifiers) {
    if (key.startsWith('phase-')) {
      if (key.endsWith('-start')) {
        modifiersStyles[key] = {
          backgroundColor: colors.background,
          borderRadius: '30px 0 0 30px',
        };
      } else if (key.endsWith('-end')) {
        modifiersStyles[key] = {
          backgroundColor: colors.background,
          borderRadius: '0 30px 30px 0',
        };
      } else {
        modifiersStyles[key] = {
          backgroundColor: colors.background,
        };
      }
    }
  }

  return modifiersStyles;
};
