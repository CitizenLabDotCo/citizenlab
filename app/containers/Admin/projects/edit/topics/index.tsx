import React, { memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { addProjectTopic, deleteProjectTopic } from 'services/projects';
import { ITopicData } from 'services/topics';

const Container = styled.div`
  min-height: 80vh;
`;

interface Props {}

const Topics = memo(({ params: { projectId } }: Props & WithRouterProps) => {
  const [processing, setProcessing] = useState(false);

  const handleRemoveSelectedTopic = useCallback((topicIdToRemove: string) => {
    deleteProjectTopic(projectId, topicIdToRemove);
  }, []);

  const handleAddSelectedTopics = async (topicsToAdd: ITopicData[]) => {
      setProcessing(true);

      const promises = topicsToAdd.map(topic => addProjectTopic(projectId, topic.id));

      try {
        await Promise.all(promises);
        setProcessing(false);
      } catch {
        setProcessing(false);
      }
  };

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionSubtitle>
      <ProjectTopicSelector
        handleAddSelectedTopics={handleAddSelectedTopics}
        processing={processing}
      />
      <SortableProjectTopicList
        onHandleRemoveSelectedTopic={handleRemoveSelectedTopic}
      />
    </Container>
  );
});

export default withRouter(Topics);
