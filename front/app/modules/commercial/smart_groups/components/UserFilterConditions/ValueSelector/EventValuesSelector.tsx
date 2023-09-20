import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useLocalize from 'hooks/useLocalize';
import useEvents from 'api/events/useEvents';
import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const EventValuesSelector = ({ value, onChange }: Props) => {
  const { data: events } = useEvents({ sort: '-start_at' });
  const localize = useLocalize();

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions(localize, events?.data)}
      onChange={handleOnChange}
    />
  );
};

export default EventValuesSelector;
