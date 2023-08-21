import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useIdeas from 'api/ideas/useIdeas';
import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const IdeaValuesSelector = ({ value, onChange }: Props) => {
  const { data: ideas } = useIdeas({ sort: 'random' });
  const localize = useLocalize();

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions(localize, ideas?.data)}
      onChange={handleOnChange}
    />
  );
};

export default IdeaValuesSelector;
