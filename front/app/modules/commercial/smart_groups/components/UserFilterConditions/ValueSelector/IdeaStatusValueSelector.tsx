import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const IdeaStatusValueSelector = memo(({ value, onChange }: Props) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: 'ideation',
  });
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (ideaStatuses) {
      return ideaStatuses.data.map((ideaStatus) => {
        return {
          value: ideaStatus.id,
          label: localize(ideaStatus.attributes.title_multiloc),
        };
      });
    } else {
      return [];
    }
  };

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default IdeaStatusValueSelector;
