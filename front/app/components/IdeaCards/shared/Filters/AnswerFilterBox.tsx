import React from 'react';

import { omit } from 'lodash-es';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import useLocalize from 'hooks/useLocalize';

import SingleSelectFilter from 'components/FilterBoxes/SingleSelectFilter';

interface Props {
  field: IFlatCustomField;
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  selectedOptionKey: string | null | undefined;
  onChange: (optionKey: string | null) => void;
}

const AnswerFilterBox = ({
  field,
  ideaQueryParameters,
  selectedOptionKey,
  onChange,
}: Props) => {
  const localize = useLocalize();
  const { data: ideasFilterCounts } = useIdeasFilterCounts({
    ...ideaQueryParameters,
    custom_field_answers: omit(
      ideaQueryParameters.custom_field_answers,
      field.id
    ),
    custom_field_ids: [field.id],
  });

  if (!ideasFilterCounts) {
    return null;
  }

  const optionCounts: Partial<Record<string, number>> =
    ideasFilterCounts.data.attributes.custom_field_answers?.[field.id] ?? {};

  return (
    <SingleSelectFilter
      title={localize(field.title_multiloc)}
      options={(field.options ?? []).flatMap((option) =>
        option.key
          ? [
              {
                id: option.key,
                label: localize(option.title_multiloc),
                count: optionCounts[option.key] ?? 0,
              },
            ]
          : []
      )}
      totalCount={ideasFilterCounts.data.attributes.total}
      selectedId={selectedOptionKey}
      onChange={onChange}
    />
  );
};

export default AnswerFilterBox;
