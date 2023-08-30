import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import { Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import useIdeas from 'api/ideas/useIdeas';
import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
}

const IdeaValueSelector = ({ value, onChange }: Props) => {
  const { data: ideas } = useIdeas({ sort: 'random' });
  const localize = useLocalize();

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions(localize, ideas?.data)}
      onChange={handleOnChange}
    />
  );
};

export default IdeaValueSelector;
