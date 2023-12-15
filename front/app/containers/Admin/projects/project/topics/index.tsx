import React, { memo } from 'react';

import {
  SectionTitle,
  SectionDescription,
  StyledLink,
} from 'components/admin/Section';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';
import HasPermission from 'components/HasPermission';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ProjectAllowedInputTopics = memo(() => {
  return (
    <Box minHeight="80vh" mb="40px">
      <SectionTitle>
        <FormattedMessage {...messages.title} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectTopicsDescription} />
        <span>
          <HasPermission
            item={{ type: 'route', path: '/admin/settings/topics' }}
            action="access"
          >
            &nbsp;
            <FormattedMessage
              {...messages.topicManagerInfo}
              values={{
                topicManagerLink: (
                  <StyledLink to="/admin/settings/topics">
                    <FormattedMessage {...messages.topicManager} />
                  </StyledLink>
                ),
              }}
            />
          </HasPermission>
        </span>
      </SectionDescription>
      <ProjectTopicSelector />
      <SortableProjectTopicList />
    </Box>
  );
});

export default ProjectAllowedInputTopics;
