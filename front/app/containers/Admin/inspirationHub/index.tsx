import React, { useState, useEffect } from 'react';

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
import useCountryCodeSupportedInProjectLibrary from './useCountryCodeSupportedInProjectLibrary';
import { setRansackParam } from './utils';

const InspirationHub = () => {
  const [initialCountryCodeSet, setInitialCountryCodeSet] = useState(false);
  const { status, countryCode } = useCountryCodeSupportedInProjectLibrary();

  useEffect(() => {
    if (initialCountryCodeSet) return;

    if (status === 'supported') {
      setRansackParam('q[pin_country_code_eq]', countryCode);
      setRansackParam('q[tenant_country_code_in]', [countryCode]);
      setInitialCountryCodeSet(true);
    }
  }, [status, countryCode, initialCountryCodeSet]);

  if (status === 'loading') {
    return null;
  }

  // If the countryCode is supported, but the param is not set yet,
  // we wait for it to be set.
  if (status === 'supported' && !initialCountryCodeSet) {
    return null;
  }

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

const InspirationHubWrapper = () => {
  const projectLibraryEnabled = useFeatureFlag({
    name: 'project_library',
    onlyCheckEnabled: true,
  });

  if (!projectLibraryEnabled) return <UpsellNudge />;

  return <InspirationHub />;
};

export default InspirationHubWrapper;
