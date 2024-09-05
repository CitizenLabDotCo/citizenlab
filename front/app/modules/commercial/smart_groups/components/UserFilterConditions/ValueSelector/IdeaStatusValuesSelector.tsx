import React, { memo } from 'react';

import { IOption } from 'typings';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const IdeaStatusValuesSelector = memo(({ value, onChange }: Props) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: undefined,
  });
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (ideaStatuses) {
      return ideaStatuses.data.map((ideaStatus) => {
        return {
          value: ideaStatus.id,
          label: `${localize(ideaStatus.attributes.title_multiloc)} (${
            ideaStatus.attributes.participation_method
          })`,
        };
      });
    } else {
      return [];
    }
  };

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value) as string[];
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default IdeaStatusValuesSelector;
