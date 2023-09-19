import React from 'react';
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Outlet from 'components/Outlet';
import InitiativesCTABox from './InitiativesCTABox';
import useCopenhagenPlatformCheck from 'hooks/useCopenhagenPlatformCheck';
import useFeatureFlag from 'hooks/useFeatureFlag';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
  border-bottom: solid 1px #eaeaea;
`;

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 60px;
  padding-bottom: 60px;

  ${media.phone`
    padding-bottom: 60px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
`;

const MainContent = () => {
  const postingPermission = useInitiativesPermissions('posting_initiative');
  const postingProposalsEnabled = !!postingPermission?.enabled;
  const hasProposalsEnabled = useFeatureFlag({
    name: 'initiatives',
  });
  const isCopenhagenPlatform = useCopenhagenPlatformCheck();
  const showProposalsCTA = postingProposalsEnabled && hasProposalsEnabled;
  const showProposalsAtTheTop = isCopenhagenPlatform && showProposalsCTA;
  const showProposalsAtTheBottom = !isCopenhagenPlatform && showProposalsCTA;
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <StyledContentContainer mode="page">
      {showProposalsAtTheTop && (
        <Box
          mt={isSmallerThanTablet ? '60px' : '80px'}
          mb={isSmallerThanTablet ? '0' : '20px'}
        >
          <InitiativesCTABox />
        </Box>
      )}
      <ProjectSection id="e2e-landing-page-project-section">
        <SectionContainer>
          <ProjectAndFolderCards
            publicationStatusFilter={['published', 'archived']}
            showTitle={true}
            layout="dynamic"
          />
        </SectionContainer>
      </ProjectSection>

      <Outlet id="app.containers.HomePage.EventsWidget" />

      {showProposalsAtTheBottom && (
        <Box mb="80px">
          <InitiativesCTABox />
        </Box>
      )}
    </StyledContentContainer>
  );
};

export default MainContent;
