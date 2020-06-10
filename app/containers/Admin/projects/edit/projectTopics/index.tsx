import React, { memo } from 'react';
import styled from 'styled-components';

import { SectionTitle, SectionSubtitle, StyledLink } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  min-height: 80vh;
`;

const ProjectTopics = memo(() => {
  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage
          {...messages.projectTopicSettingsDescription}
          values={{
            topicManagerLink:
              <StyledLink to="/admin/settings/topics">
                <FormattedMessage {...messages.topicManager} />
              </StyledLink>
          }}
        />
      </SectionSubtitle>
      <ProjectTopicSelector />
      <SortableProjectTopicList />
    </Container>
  );
});

export default ProjectTopics;
