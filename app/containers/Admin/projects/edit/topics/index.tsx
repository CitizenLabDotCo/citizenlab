import React, { memo, useCallback } from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { deleteProjectTopic } from 'services/projects';

const Container = styled.div`
  min-height: 80vh;
`;

interface Props {}

const Topics = memo(({ params: { projectId } }: Props & WithRouterProps) => {

  const handleRemoveSelectedTopic = useCallback((topicIdToRemove: string) => {
    deleteProjectTopic(projectId, topicIdToRemove);
  }, []);

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionSubtitle>
      <ProjectTopicSelector />
      <SortableProjectTopicList
        onHandleRemoveSelectedTopic={handleRemoveSelectedTopic}
      />
    </Container>
  );
});

export default withRouter(Topics);
