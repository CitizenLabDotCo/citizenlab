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
import useProject from 'hooks/useProject';

// services
import { updateProject } from 'services/projects';

const Container = styled.div``;

interface Props {}

const Topics = memo(({ params: { projectId } }: Props & WithRouterProps) => {
  const topics = useTopics();
  const project = useProject({ projectId });

  const handleRemoveSelectedTopic = useCallback(
    (currentSelectedTopics: string[]) => (topicIdToRemove: string) => {
      const updatedSelectedTopicIds = currentSelectedTopics.filter(topicId => topicId !== topicIdToRemove);
      updateProject(projectId, { topic_ids: updatedSelectedTopicIds });
    }, []
  );

  const handleAddSelectedTopics = useCallback((toBeAddedtopicIds: string[]) => {
    // add code to save topics to a project

  }, []);

  if (
    !isNilOrError(topics) &&
    !isNilOrError(project)
  ) {
    const topicIds = topics
      .map(topic => !isNilOrError(topic) ? topic.id : null)
      .filter(topic => topic) as string[];
    const projectTopicIds =  project.relationships.topics.data ?
      project.relationships.topics.data.map(topic => topic.id) : [];
    const selectableTopicIds = topicIds.filter(topicId => !projectTopicIds.includes(topicId));

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
          selectedTopicIds={projectTopicIds}
          onHandleRemoveSelectedTopic={handleRemoveSelectedTopic(projectTopicIds)}
        />
      </Container>
    );
  }

  return null;
});

export default withRouter(Topics);
