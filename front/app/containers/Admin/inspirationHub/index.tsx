import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import sidebarMessages from 'containers/Admin/sideBar/messages';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import Filters from './Filters';
import messages from './messages';
import PinnedProjects from './PinnedProjects';
import ProjectCards from './ProjectCards';
import ProjectDrawer from './ProjectDrawer';
import SortAndReset from './SortAndReset';
import UpsellNudge from './UpsellNudge';

const InspirationHub = () => {
  const projectLibraryEnabled = useFeatureFlag({
    name: 'project_library',
    onlyCheckEnabled: true,
  });

  if (!projectLibraryEnabled) return <UpsellNudge />;

  return (
    <Box>
      <Box
        id="inspiration-hub"
        overflowY="scroll"
        height={`100vh`}
        py="45px"
        px="51px"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box maxWidth="1400px" w="100%">
          <Title variant="h1" color="primary" mb="36px">
            <FormattedMessage {...sidebarMessages.inspirationHub} />
          </Title>
          <Box>
            <PinnedProjects />
          </Box>
          <Box mt="40px" id="inspiration-hub-all-projects">
            <Title variant="h2" color="primary" mt="0">
              <FormattedMessage {...messages.allProjects} />
            </Title>
            <Box>
              <Filters />
            </Box>
            <SortAndReset />
            <ProjectCards />
            <Box mt="32px">
              <Warning>
                <FormattedMessage
                  {...messages.seemsLike}
                  values={{
                    filters: (
                      <button
                        onClick={() => {
                          const allProjectsTop = document.getElementById(
                            'inspiration-hub-all-projects'
                          );
                          allProjectsTop?.scrollIntoView({
                            behavior: 'smooth',
                          });
                        }}
                      >
                        <FormattedMessage {...messages.filters} />
                      </button>
                    ),
                  }}
                />
              </Warning>
            </Box>
          </Box>
        </Box>
      </Box>
      <ProjectDrawer />
    </Box>
  );
};

export default InspirationHub;
