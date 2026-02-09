import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { TRule } from '../rules';

import { generateOptions } from './utils';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string[]) => void;
}

const EventValuesSelector = ({ value, onChange }: Props) => {
  const { data: events, isLoading } = useEvents({
    sort: '-start_at',
    pageSize: 1000,
    show_unlisted_events_user_can_moderate: true,
  });
  const localize = useLocalize();

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  if (isLoading) return <Spinner />;

  return (
    <MultipleSelect
      value={value}
      options={generateOptions(localize, events?.data)}
      onChange={handleOnChange}
    />
  );
};

export default EventValuesSelector;
