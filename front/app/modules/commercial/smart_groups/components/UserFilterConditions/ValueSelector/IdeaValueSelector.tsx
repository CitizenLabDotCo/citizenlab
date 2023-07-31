import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import { Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import useIdeas from 'api/ideas/useIdeas';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
}

const IdeaValueSelector = ({ value, onChange }: Props) => {
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
};

export default IdeaValueSelector;
