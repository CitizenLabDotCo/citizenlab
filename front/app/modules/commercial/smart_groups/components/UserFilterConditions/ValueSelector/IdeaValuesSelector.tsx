import React from 'react';

import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

import useIdeas from 'api/ideas/useIdeas';

import useLocalize from 'hooks/useLocalize';

import { TRule } from '../rules';

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
    // TODO: use front/app/components/UI/IdeaSelect/index.tsx to show all ideas.
    <MultipleSelect
      value={value}
      options={generateOptions(localize, ideas?.data)}
      onChange={handleOnChange}
    />
  );
};

export default IdeaValuesSelector;
