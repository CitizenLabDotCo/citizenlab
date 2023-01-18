import React from 'react';
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import FeatureFlag from 'components/FeatureFlag';
import InitiativesCTABox from './InitiativesCTABox';

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

const StyledInitiativesCTABox = styled(InitiativesCTABox)`
  margin-bottom: 40px;
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

      <FeatureFlag name="initiatives">
        {postingProposalsEnabled && <StyledInitiativesCTABox />}
      </FeatureFlag>
    </StyledContentContainer>
  );
};

export default MainContent;
