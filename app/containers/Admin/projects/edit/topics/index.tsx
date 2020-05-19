import React, { memo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { isString } from 'lodash-es';

import { Section, SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
import TopicSearch from './TopicSearch';
import TopicList from './TopicList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useTopics from 'hooks/useTopics';

const Container = styled.div``;

const Topics = memo(() => {
  const topics = useTopics();
  const topicIds = !isNilOrError(topics) ?
    topics.map(topic => !isNilOrError(topic) ? topic.id : topic)
    :
    [];
  const defaultTopicIds = topicIds.filter(topicId => isString(topicId)); // TODO
  const [selectedTopicIds, setSelectedTopicIds] = useState(defaultTopicIds);
  const selectableTopicIds = topicIds.filter(topicId => !selectedTopicIds.includes(topicId));

  const handleRemoveSelectedTopic = useCallback((topicId: string) => {
    const newSelectedTopicIds = selectedTopicIds.filter(topic => !isNilOrError(topic) && topic.id !== topicId);
    setSelectedTopicIds(newSelectedTopicIds);
  }, []);

  const handleAddSelectedTopic = useCallback((topicId: string) => {
    setSelectedTopicIds(selectedTopicIds => {
      const newSelectedTopicIds = selectedTopicIds;
      newSelectedTopicIds.push(topicId);

      return newSelectedTopicIds;
    });
  }, []);

  if (!isNilOrError(topics)) {

    return (
      <Container>
        <SectionTitle>
          <FormattedMessage {...messages.titleDescription} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitleDescription} />
        </SectionSubtitle>
        <TopicSearch
          selectableTopicIds={selectableTopicIds}
          handleAddSelectedTopic={handleAddSelectedTopic}
        />
        <TopicList
          selectedTopicIds={selectedTopicIds}
          handleRemoveSelectedTopic={handleRemoveSelectedTopic}
        />
      </Container>
    );
  }

  return null;
});

export default Topics;
