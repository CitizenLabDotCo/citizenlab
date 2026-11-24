import { useState } from 'react';

import { Agreement, CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

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

const useAgreementFilter = ({
  statements,
  filtered,
  onChange,
}: {
  statements: CommonGroundResultItem[];
  filtered: IIdeasFilterCountsQueryParameters | undefined;
  onChange: () => void;
}) => {
  const { formatMessage } = useIntl();
  const [selected, setSelected] = useState<Agreement[]>([]);

  // Count each agreement within the current search and sidebar filters.
  const filteredCount = (agreement: Agreement) => ({
    ...filtered,
    agreements: [agreement],
  });
  const { data: agreeCounts } = useIdeasFilterCounts(
    filteredCount('agree'),
    !!filtered
  );
  const { data: splitCounts } = useIdeasFilterCounts(
    filteredCount('split'),
    !!filtered
  );
  const { data: disagreeCounts } = useIdeasFilterCounts(
    filteredCount('disagree'),
    !!filtered
  );
  const filteredTotals: Record<Agreement, number | undefined> = {
    agree: agreeCounts?.data.attributes.total,
    split: splitCounts?.data.attributes.total,
    disagree: disagreeCounts?.data.attributes.total,
  };

  const change = (next: string[]) => {
    setSelected(next.filter(isAgreement));
    onChange();
  };

  const category: FilterCategory = {
    key: 'agreement',
    label: formatMessage(messages.agreementFilter),
    icon: 'circle-check-filled-16',
    options: AGREEMENTS.map(({ value, label }) => {
      const count =
        (filtered && filteredTotals[value]) ??
        statements.filter((statement) => statement.agreement === value).length;

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
