import React, { memo } from 'react';
import { IOption } from 'typings';
import useIdeaStatuses from 'hooks/useIdeaStatuses';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const IdeaStatusValuesSelector = memo(({ value, onChange }: Props) => {
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
