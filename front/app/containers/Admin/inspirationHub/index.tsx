import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

import Filters from './Filters';
import ProjectDrawer from './ProjectDrawer';
import ProjectTable from './ProjectTable';

const InspirationHub = () => {
  const projectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  if (!projectLibraryEnabled) return null;

  return (
    <>
      <Box>
        <Title variant="h1" color="primary" mb="40px">
          <FormattedMessage {...messages.inspirationHub} />
        </Title>
        <Box>
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
