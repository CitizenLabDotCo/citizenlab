import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useInitiatives from 'api/initiatives/useInitiatives';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const InitiativeValuesSelector = ({ value, onChange }: Props) => {
  const { data: initiatives } = useInitiatives({});
  const localize = useLocalize();

  const generateOptions = (): IOption[] => {
    if (initiatives?.data) {
      return initiatives.data.map((initiative) => {
        return {
          value: initiative.id,
          label: localize(initiative.attributes.title_multiloc),
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

export default InitiativeValuesSelector;
