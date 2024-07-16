import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { ITopicData } from 'api/topics/types';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const TopicValueSelector = memo(({ value, onChange }: Props) => {
  const { data: topics } = useTopics();
  const localize = useLocalize();

  const generateOptions = (): IOption[] => {
    return !topics
      ? []
      : topics.data.map((topic: ITopicData) => ({
          value: topic.id,
          label: localize(topic.attributes.title_multiloc),
        }));
  };

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
});

export default TopicValueSelector;
