import { useState } from 'react';

import { CommonGroundResultItem } from 'api/common_ground/types';

import { useIntl } from 'utils/cl-intl';

import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';

import messages from './messages';
import { agreePercent, totalReactions, Votes } from './utils';

const AGREEMENTS = [
  { value: 'agree', label: messages.mostlyAgree },
  { value: 'split', label: messages.divided },
  { value: 'disagree', label: messages.mostlyDisagree },
];

// A statement nobody reacted to has no agreement to speak of.
const agreementOf = (votes: Votes) => {
  if (totalReactions(votes) === 0) return undefined;

  const percent = agreePercent(votes);
  if (percent >= 60) return 'agree';
  return percent < 40 ? 'disagree' : 'split';
};

const useAgreementFilter = (
  statements: CommonGroundResultItem[],
  onChange: () => void
) => {
  const { formatMessage } = useIntl();
  const [selected, setSelected] = useState<string[]>([]);

  const idsOf = (agreement: string) =>
    statements
      .filter(({ votes }) => agreementOf(votes) === agreement)
      .map(({ id }) => id);

  const change = (next: string[]) => {
    setSelected(next);
    onChange();
  };

  const category: FilterCategory = {
    key: 'agreement',
    label: formatMessage(messages.agreementFilter),
    icon: 'check-circle',
    options: AGREEMENTS.map(({ value, label }) => {
      const count = idsOf(value).length;

      return {
        value,
        label: formatMessage(label),
        count,
        disabled: count === 0,
      };
    }),
    selected,
    multiple: true,
    isActive: selected.length > 0,
    toggle: (value) =>
      change(
        selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value]
      ),
    clear: () => change([]),
  };

  return {
    category,
    ideaIds: selected.length > 0 ? selected.flatMap(idsOf) : undefined,
  };
};

export default useAgreementFilter;
