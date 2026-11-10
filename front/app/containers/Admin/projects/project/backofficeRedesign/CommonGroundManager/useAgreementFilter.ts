import { useState } from 'react';

import { Agreement, CommonGroundResultItem } from 'api/common_ground/types';

import { useIntl } from 'utils/cl-intl';

import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import { toggled } from '../InputManager/utils';

import messages from './messages';

const AGREEMENTS: { value: Agreement; label: typeof messages.mostlyAgree }[] = [
  { value: 'agree', label: messages.mostlyAgree },
  { value: 'split', label: messages.divided },
  { value: 'disagree', label: messages.mostlyDisagree },
];

const isAgreement = (value: string): value is Agreement =>
  AGREEMENTS.some((agreement) => agreement.value === value);

const useAgreementFilter = (
  statements: CommonGroundResultItem[],
  onChange: () => void
) => {
  const { formatMessage } = useIntl();
  const [selected, setSelected] = useState<Agreement[]>([]);

  const change = (next: string[]) => {
    setSelected(next.filter(isAgreement));
    onChange();
  };

  const category: FilterCategory = {
    key: 'agreement',
    label: formatMessage(messages.agreementFilter),
    icon: 'check-circle',
    options: AGREEMENTS.map(({ value, label }) => {
      const count = statements.filter(
        (statement) => statement.agreement === value
      ).length;

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
    toggle: (value) => change(toggled(selected, value)),
    clear: () => change([]),
  };

  return {
    category,
    agreements: selected.length > 0 ? selected : undefined,
  };
};

export default useAgreementFilter;
