import React, { memo } from 'react';

import { IOption } from 'typings';

import { IGlobalTopicData } from 'api/global_topics/types';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const GlobalTopicValuesSelector = memo(({ value, onChange }: Props) => {
  const { data: topics } = useGlobalTopics();
  const localize = useLocalize();

  const generateOptions = (): IOption[] => {
    return !topics
      ? []
      : topics.data.map((topic: IGlobalTopicData) => ({
          value: topic.id,
          label: localize(topic.attributes.title_multiloc),
        }));
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
});

export default GlobalTopicValuesSelector;
