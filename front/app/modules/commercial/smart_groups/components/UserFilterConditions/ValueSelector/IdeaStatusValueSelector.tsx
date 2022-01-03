import React, { memo } from 'react';
import { IOption } from 'typings';
import useIdeaStatuses from 'hooks/useIdeaStatuses';
import useLocalize from 'hooks/useLocalize';
import { Select } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const IdeaStatusValueSelector = memo(({ value, onChange }: Props) => {
  const ideaStatuses = useIdeaStatuses();
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (!isNilOrError(ideaStatuses)) {
      return ideaStatuses.map((ideaStatus) => {
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
