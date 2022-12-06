import React from 'react';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import { media, colors } from 'utils/styleUtils';
import ContentContainer from 'components/ContentContainer';
import FeatureFlag from 'components/FeatureFlag';
import Outlet from 'components/Outlet';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
// style
import styled from 'styled-components';
import InitiativesCTABox from './InitiativesCTABox';

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
  border-bottom: solid 1px #eaeaea;
`;

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 40px;
  padding-bottom: 90px;

  ${media.phone`
    padding-bottom: 60px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const StyledInitiativesCTABox = styled(InitiativesCTABox)`
  padding-top: 10px;
  padding-bottom: 40px;
`;

const MainContent = () => {
  const postingPermission = useInitiativesPermissions('posting_initiative');
  const postingProposalsEnabled = !!postingPermission?.enabled;

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

      <FeatureFlag name="initiatives">
        {postingProposalsEnabled && <StyledInitiativesCTABox />}
      </FeatureFlag>
    </StyledContentContainer>
  );
};

export default MainContent;
