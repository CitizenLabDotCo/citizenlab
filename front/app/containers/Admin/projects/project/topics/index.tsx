import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import {
  SectionTitle,
  SectionDescription,
  StyledLink,
} from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ProjectTopicSelector from './ProjectTopicSelector';
import SortableProjectTopicList from './SortableProjectTopicList';
import { isAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';

const ProjectAllowedInputTopics = () => {
  const { data: authUser } = useAuthUser();

  if (!authUser) return null;

  const canAccessPlatformTopicsSettingsRoute = isAdmin(authUser);

  return (
    <Box minHeight="80vh" mb="40px">
      <SectionTitle>
        <FormattedMessage {...messages.title} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectTopicsDescription} />
        {canAccessPlatformTopicsSettingsRoute && (
          <span>
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
          </span>
        )}
      </SectionDescription>
      <ProjectTopicSelector />
      <SortableProjectTopicList />
    </Box>
  );
};

export default ProjectAllowedInputTopics;
