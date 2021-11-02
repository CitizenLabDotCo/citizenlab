import React, { memo } from 'react';
import { IOption } from 'typings';
import useTopics from 'hooks/useTopics';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

export interface Props {
  value: string;
  onChange: (value: string[]) => void;
}

const TopicValuesSelector = memo(({ value, onChange }: Props) => {
  const topics = useTopics({});
  const localize = useLocalize();
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
