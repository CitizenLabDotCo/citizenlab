import React, { useMemo } from 'react';

import useInputTopics from 'api/input_topics/useInputTopics';

import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  selectedTopicIds: string[];
  alignment: 'left' | 'right';
  onChange: (value: string[]) => void;
  projectId: string;
}

const TopicFilterDropdown = ({
  selectedTopicIds,
  alignment,
  projectId,
  onChange,
}: Props) => {
  const localize = useLocalize();
  const { data: inputTopics } = useInputTopics(projectId);

  const options = useMemo(() => {
    return (
      inputTopics?.data.map((topic) => ({
        text: localize(topic.attributes.full_title_multiloc),
        value: topic.id,
      })) ?? []
    );
  }, [inputTopics, localize]);

  if (!inputTopics || inputTopics.data.length === 0) {
    return null;
  }

  return (
    <FilterSelector
      id="e2e-idea-filter-selector"
      title={
        <FormattedMessage
          {...messages.topicsTitle}
          key={`topic-title-${Math.floor(Math.random() * 100000000)}`}
        />
      }
      name="topics"
      selected={selectedTopicIds}
      values={options}
      onChange={onChange}
      multipleSelectionAllowed={true}
      last={false}
      left={alignment === 'left' ? '-5px' : undefined}
      mobileLeft={alignment === 'left' ? '-5px' : undefined}
      right={alignment === 'right' ? '-5px' : undefined}
      mobileRight={alignment === 'right' ? '-5px' : undefined}
    />
  );
};

export default TopicFilterDropdown;
