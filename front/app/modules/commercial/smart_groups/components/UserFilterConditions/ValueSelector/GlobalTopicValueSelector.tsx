import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IGlobalTopicData } from 'api/global_topics/types';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (value: string) => void;
}

const GlobalTopicValueSelector = memo(({ value, onChange }: Props) => {
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

export default GlobalTopicValueSelector;
