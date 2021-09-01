import React, { memo } from 'react';
import { IOption } from 'typings';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

interface Props {
  value: string;
  onChange: (string) => void;
  topics: GetTopicsChildProps;
}

const TopicValueSelector = memo(
  ({ value, onChange, topics, localize }: Props & InjectedLocalized) => {
    const generateOptions = (): IOption[] => {
      if (!isNilOrError(topics)) {
        return topics
          .filter((topic) => !isNilOrError(topic))
          .map((topic: ITopicData) => {
            return {
              value: topic.id,
              label: localize(topic.attributes.title_multiloc),
            };
          });
      } else {
        return [];
      }
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
  }
);

const TopicValueSelectorWithHOC = localize(TopicValueSelector);

export default (inputProps) => (
  <GetTopics>
    {(topics) => <TopicValueSelectorWithHOC {...inputProps} topics={topics} />}
  </GetTopics>
);
