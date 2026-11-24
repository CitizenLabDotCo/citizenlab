import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import SingleSelectFilter from 'components/FilterBoxes/SingleSelectFilter';

interface Props {
  field: IFlatCustomField;
  optionCounts: Partial<Record<string, number>> | undefined;
  totalCount: number | undefined;
  selectedOptionKey: string | null | undefined;
  onChange: (optionKey: string | null) => void;
}

const AnswerFilterBox = ({
  field,
  optionCounts,
  totalCount,
  selectedOptionKey,
  onChange,
}: Props) => {
  const localize = useLocalize();

  if (totalCount === undefined) {
    return null;
  }

  return (
    <SingleSelectFilter
      title={localize(field.title_multiloc)}
      options={(field.options ?? []).flatMap((option) =>
        option.key
          ? [
              {
                id: option.key,
                label: localize(option.title_multiloc),
                count: optionCounts?.[option.key] ?? 0,
              },
            ]
          : []
      )}
      totalCount={totalCount}
      selectedId={selectedOptionKey}
      onChange={onChange}
    />
  );
};

export default AnswerFilterBox;
