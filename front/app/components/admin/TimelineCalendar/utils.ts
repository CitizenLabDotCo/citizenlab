import { colors } from '@citizenlab/cl2-component-library';

import { DateRange } from './typings';

type GetModifiersParams = {
  phases: DateRange[];
  selectedPhaseIndex: number;
};

export const getModifiers = ({
  phases,
  selectedPhaseIndex,
}: GetModifiersParams) => {
  if (phases.length < 2) return {};

  return phases.reduce((acc, phase, index) => {
    if (index === selectedPhaseIndex) {
      return acc;
    }

    return {
      ...acc,
      [`phase-${index}`]: { from: phase.from, to: phase.to },
      [`phase-${index}-start`]: phase.from,
      [`phase-${index}-end`]: phase.to,
    };
  }, {} as Record<string, DateRange | Date>);
};

export const getModifierStyles = (
  modifiers: Record<string, DateRange | Date>
) => {
  const modifiersStyles = {};

  for (const key in modifiers) {
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

  return modifiersStyles;
};
