import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useIdeas from 'api/ideas/useIdeas';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const IdeaValuesSelector = ({ value, onChange }: Props) => {
  const { data: ideas } = useIdeas({ sort: 'random' });
  const localize = useLocalize();

  const generateOptions = (): IOption[] => {
    if (ideas?.data) {
      return ideas.data.map((idea) => {
        return {
          value: idea.id,
          label: localize(idea.attributes.title_multiloc),
        };
      });
    }
    return [];
  };

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
};

export default IdeaValuesSelector;
