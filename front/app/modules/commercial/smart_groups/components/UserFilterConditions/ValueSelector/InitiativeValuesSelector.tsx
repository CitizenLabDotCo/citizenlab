import React from 'react';

import { IOption } from 'typings';

import useInitiatives from 'api/initiatives/useInitiatives';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { TRule } from '../rules';

import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const InitiativeValuesSelector = ({ value, onChange }: Props) => {
  const { data: initiatives } = useInitiatives({});
  const localize = useLocalize();

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions(localize, initiatives?.data)}
      onChange={handleOnChange}
    />
  );
};

export default InitiativeValuesSelector;
