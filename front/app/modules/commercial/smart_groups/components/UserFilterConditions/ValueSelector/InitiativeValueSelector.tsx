import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useInitiatives from 'api/initiatives/useInitiatives';

import useLocalize from 'hooks/useLocalize';

import { TRule } from '../rules';

import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
}

const InitiativeValueSelector = ({ value, onChange }: Props) => {
  const { data: initiatives } = useInitiatives({});
  const localize = useLocalize();

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions(localize, initiatives?.data)}
      onChange={handleOnChange}
    />
  );
};

export default InitiativeValueSelector;
