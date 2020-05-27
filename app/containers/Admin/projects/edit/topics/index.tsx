import React, { memo, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import ProjectTopicList from './ProjectTopicList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useTopics from 'hooks/useTopics';

// services
import { updateProject } from 'services/projects';

const Container = styled.div``;

interface Props {}

const Topics = memo(({ params: { projectId } }: Props & WithRouterProps) => {
  const topics = useTopics();
  const topicIds = !isNilOrError(topics) ?
    topics.map(topic => !isNilOrError(topic) ? topic.id : null)
          .filter(topic => topic) as string[]
    :
    [];
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const selectableTopicIds = topicIds.filter(topicId => !selectedTopicIds.includes(topicId));

  useEffect(() => {
    setSelectedTopicIds(topicIds);
  }, [topics]);

  const handleRemoveSelectedTopic = useCallback((topicIdToRemove: string) => {
    const updatedSelectedTopicIds = topicIds.filter(topicId => topicId !== topicIdToRemove);
    updateProject(projectId, { topic_ids: updatedSelectedTopicIds });
  }, []);

  const handleAddSelectedTopics = useCallback((topicIds: string[]) => {
    // add code to save topics to a project

    // add code to update selected topics state
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
        onHandleRemoveSelectedTopic={handleRemoveSelectedTopic}
      />
    </Container>
  );
});

export default withRouter(Topics);
