import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useInitiatives from 'api/initiatives/useInitiatives';
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
