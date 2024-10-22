import React, { useMemo } from 'react';

import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

import { FormattedMessage } from 'utils/cl-intl';
import { byId } from 'utils/helperUtils';

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
  const { data: allowedInputTopics } = useProjectAllowedInputTopics({
    projectId,
  });

  const topicIds = getTopicIds(allowedInputTopics?.data);
  const { data: topics } = useTopics();

  const topicsById = useMemo(() => {
    const filteredTopics =
      topics?.data.filter((topic) => topicIds.includes(topic.id)) || [];
    return !topics ? null : byId(filteredTopics);
  }, [topics, topicIds]);

  const filteredTopics = useMemo(() => {
    if (!topicsById) return [];

    // Create filtered topics in the order of topicIds
    return topicIds.map((id) => topicsById[id]).filter(Boolean);
  }, [topicsById, topicIds]);

  const options = useMemo(() => {
    return (
      filteredTopics?.map((topic) => ({
        text: localize(topic.attributes.title_multiloc),
        value: topic.id,
      })) ?? []
    );
  }, [filteredTopics, localize]);

  if (!allowedInputTopics || allowedInputTopics.data.length === 0) {
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
