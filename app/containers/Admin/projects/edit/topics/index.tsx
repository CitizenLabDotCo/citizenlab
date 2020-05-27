import React, { memo, useCallback, useState } from 'react';
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
  const [processing, setProcessing] = useState(false);

  const handleRemoveSelectedTopic = useCallback(
    (currentSelectedTopics: string[]) => (topicIdToRemove: string) => {
      const updatedSelectedTopicIds = currentSelectedTopics.filter(topicId => topicId !== topicIdToRemove);

      updateProject(projectId, { topic_ids: updatedSelectedTopicIds });
    }, []
  );

  const handleAddSelectedTopics = useCallback(async (toBeAddedtopicIds: string[]) => {
    // add code to save topics to a project
      setProcessing(true);
      const promises = toBeAddedtopicIds.map(topicId => updateProject(projectId, { topic_id: topicId }));

      try {
        await Promise.all(promises);
        setProcessing(false);
      } catch {
        setProcessing(false);
      }
  }, []);

  if (
    !isNilOrError(topics) &&
    !isNilOrError(project)
  ) {
    const topicIds = topics
      .map(topic => !isNilOrError(topic) ? topic.id : null)
      .filter(topic => topic) as string[];
    const selectedTopicIds =  project.relationships.topics.data ?
      project.relationships.topics.data.map(topic => topic.id) : [];
    const selectableTopicIds = topicIds.filter(topicId => !selectedTopicIds.includes(topicId));

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
          processing={processing}
        />
        <ProjectTopicList
          selectedTopicIds={selectedTopicIds}
          onHandleRemoveSelectedTopic={handleRemoveSelectedTopic(selectedTopicIds)}
        />
      </Container>
    );
  }

  return null;
});

export default withRouter(Topics);
