import React, { memo, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { isString } from 'lodash-es';

import { Section, SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import ProjectTopicList from './ProjectTopicList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useTopics from 'hooks/useTopics';

const Container = styled.div``;

const Topics = memo(() => {
  const topics = useTopics();
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const selectableTopicIds = selectedTopicIds.filter(topicId => !selectedTopicIds.includes(topicId));

  useEffect(() => {
    const topicIds = !isNilOrError(topics) ?
    topics.map(topic => !isNilOrError(topic) ? topic.id : null)
          .filter(topic => topic) as string[]
    :
    [];

    setSelectedTopicIds(topicIds);
  }, [topics]);

  const handleRemoveSelectedTopic = useCallback((topicIdToRemove: string) => {
    const newSelectedTopicIds = selectedTopicIds.filter(topicId => topicId !== topicIdToRemove);
    setSelectedTopicIds(newSelectedTopicIds);
  }, []);

  const handleAddSelectedTopics = useCallback((topicIds: string[]) => {
    setSelectedTopicIds(selectedTopicIds => {
      return selectedTopicIds.concat(topicIds);
    });
  }, []);

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionSubtitle>
      <ProjectTopicSelector
        selectableTopicIds={selectableTopicIds}
        handleAddSelectedTopics={handleAddSelectedTopics}
      />
      <ProjectTopicList
        selectedTopicIds={selectedTopicIds}
        handleRemoveSelectedTopic={handleRemoveSelectedTopic}
      />
    </Container>
  );
});

export default Topics;
