import React from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import sidebarMessages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import Filters from './Filters';
import messages from './messages';
import PinnedProjects from './PinnedProjects';
import ProjectCards from './ProjectCards';
import ProjectDrawer from './ProjectDrawer';

const InspirationHub = () => {
  const projectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  const { data: appConfiguration } = useAppConfiguration();
  if (!projectLibraryEnabled || !appConfiguration) return null;

  const countryCode = appConfiguration.data.attributes.country_code;

  return (
    <>
      <Box>
        <Title variant="h1" color="primary" mb="36px">
          <FormattedMessage {...sidebarMessages.inspirationHub} />
        </Title>
        <Box>
          <PinnedProjects />
        </Box>
        <Box mt="40px">
          <Title variant="h2" color="primary" mt="0">
            <FormattedMessage {...messages.allProjects} />
          </Title>
          <Box>
            <Filters />
          </Box>
          <Box mb="24px" display="flex">
            <Button
              buttonStyle="text"
              pl="0"
              onClick={() => {
                const search = countryCode
                  ? `?q[tenant_country_alpha2_eq]=${countryCode}`
                  : '';

                clHistory.replace({
                  pathname: window.location.pathname,
                  search,
                });
              }}
            >
              <FormattedMessage {...messages.resetFilters} />
            </Button>
          </Box>
          <ProjectCards />
        </Box>
      </Box>
      <ProjectDrawer />
    </>
  );
};

export default InspirationHub;
