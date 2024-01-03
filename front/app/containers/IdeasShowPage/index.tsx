import React from 'react';
import { useParams } from 'react-router-dom';

// components
import {
  Box,
  useBreakpoint,
  Spinner,
  stylingConsts,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from './IdeaShowPageTopBar';
import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

// context
import { VotingContext } from 'api/baskets_ideas/useVoting';

// hooks
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';

// style
import styled from 'styled-components';

// utils
import { isUnauthorizedRQ } from 'utils/errorUtils';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import ProjectCTABar from 'containers/ProjectsShowPage/ProjectCTABar';

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

// note: StyledIdeasShow styles defined here should match that in PostPageFullscreenModal!
const StyledIdeasShow = styled(IdeasShow)`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${({ theme }) => media.tablet`
    margin-top: ${theme.menuHeight}px;
    min-height: calc(100vh - ${theme.mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const IdeasShowPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data: idea, status, error } = useIdeaBySlug(slug);
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(project?.data.id);

  if (!project) return null;

  if (status === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  const phase = getCurrentPhase(phases?.data);
  const isIdeaInCurrentPhase =
    idea.data.relationships.phases.data.filter(
      (iteratedPhase) => iteratedPhase.id === phase?.id
    ).length > 0;
  const showCTABar =
    isIdeaInCurrentPhase && phase?.attributes.participation_method === 'voting';
  const showCTABarAtTopOfPage = !isSmallerThanTablet && showCTABar;

  return (
    <VotingContext projectId={project.data.id}>
      <Box
        background={colors.white}
        pt={showCTABarAtTopOfPage ? `${stylingConsts.menuHeight}px` : undefined}
      >
        {isSmallerThanTablet && (
          <StyledIdeaShowPageTopBar
            projectId={idea.data.relationships.project.data.id}
            ideaId={idea.data.id}
            phase={phase}
          />
        )}
        <StyledIdeasShow
          ideaId={idea.data.id}
          projectId={idea.data.relationships.project.data.id}
          compact={isSmallerThanTablet}
        />
      </Box>
      {showCTABar && (
        <Box
          position="fixed"
          bottom={isSmallerThanTablet ? '0px' : undefined} // Show CTA at bottom of screen on mobile
          width="100vw"
        >
          <ProjectCTABar projectId={project.data.id} />
        </Box>
      )}
    </VotingContext>
  );
};

export default IdeasShowPage;
