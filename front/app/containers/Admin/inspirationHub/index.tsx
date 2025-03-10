import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import sidebarMessages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

import Filters from './Filters';
import messages from './messages';
import PinnedProjects from './PinnedProjects';
import ProjectDrawer from './ProjectDrawer';
import ProjectTable from './ProjectTable';

const InspirationHub = () => {
  const projectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  if (!projectLibraryEnabled) return null;

  return (
    <>
      <Box>
        <Title variant="h1" color="primary" mb="36px">
          <FormattedMessage {...sidebarMessages.inspirationHub} />
        </Title>
        <Box>
          <Title variant="h2" color="primary" mt="0px">
            <FormattedMessage {...messages.highlighted} />
          </Title>
          <PinnedProjects />
        </Box>
        <Box mt="40px">
          <Title variant="h2" color="primary" mt="0">
            <FormattedMessage {...messages.allProjects} />
          </Title>
          <Box mb="24px">
            <Filters />
          </Box>
          <ProjectTable />
        </Box>
      </Box>
      <ProjectDrawer />
    </>
  );
};

export default InspirationHub;
