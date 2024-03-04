import React, { memo } from 'react';

import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

import { ITopicData } from 'api/topics/types';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const TopicValuesSelector = memo(({ value, onChange }: Props) => {
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

export default TopicValuesSelector;
