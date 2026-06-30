import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useIdeas from 'api/ideas/useIdeas';

import useLocalize from 'hooks/useLocalize';

import { TRule } from '../rules';

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
    // TODO: use front/app/components/UI/IdeaSelect/index.tsx to show all ideas.
    <Select
      value={value}
      options={generateOptions(localize, ideas?.data)}
      onChange={handleOnChange}
    />
  );
};

export default IdeaValueSelector;
