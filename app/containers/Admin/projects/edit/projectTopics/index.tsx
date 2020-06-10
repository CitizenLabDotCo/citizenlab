import React, { memo } from 'react';
import styled from 'styled-components';

import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';
import Link from 'utils/cl-router/Link';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  min-height: 80vh;
`;

const StyledLink = styled(Link)`
  text-decoration: underline;
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
