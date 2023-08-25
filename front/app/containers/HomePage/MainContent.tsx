import React from 'react';
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import Outlet from 'components/Outlet';
import InitiativesCTABox from './InitiativesCTABox';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

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

const StyledInitiativesCTABox = styled(InitiativesCTABox)`
  margin-bottom: 40px;
`;

const MainContent = () => {
  const postingPermission = useInitiativesPermissions('posting_initiative');
  const postingProposalsEnabled = !!postingPermission?.enabled;
  const proposalsFeatureEnabled = useFeatureFlag({ name: 'initiatives' });
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;
  const tenantName = appConfiguration.data.attributes.name;

  return (
    <StyledContentContainer mode="page">
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

      {proposalsFeatureEnabled &&
        postingProposalsEnabled &&
        tenantName !== 'KøbenhavnsKommune' && <StyledInitiativesCTABox />}
    </StyledContentContainer>
  );
};

export default MainContent;
