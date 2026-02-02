import React from 'react';

import {
  Box,
  useBreakpoint,
  Spinner,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { VotingContext } from 'api/baskets_ideas/useVoting';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import IdeasShow from 'containers/IdeasShow';
import IdeaMeta from 'containers/IdeasShow/components/IdeaMeta';
import ProjectCTABar from 'containers/ProjectsShowPage/ProjectCTABar';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isUnauthorizedRQ } from 'utils/errorUtils';

import DesktopTopBar from './DesktopTopBar';
import IdeaShowPageTopBar from './IdeaShowPageTopBar';

// note: StyledIdeasShow styles defined here should match that in PostPageFullscreenModal!
const StyledIdeasShow = styled(IdeasShow)`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${({ theme }) => media.tablet`
    min-height: calc(100vh - ${theme.mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const IdeasShowPage = () => {
  const theme = useTheme();
  const { slug } = useParams() as { slug: string };
  const { data: idea, status, error } = useIdeaBySlug(slug);
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(project?.data.id);

  const [searchParams] = useSearchParams();
  const phaseContext = searchParams.get('phase_context');

  if (!project) return <PageNotFound />;

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

  return (
    <>
      <IdeaMeta ideaId={idea.data.id} />
      <VotingContext
        projectId={project.data.id}
        phaseId={phaseContext || phase?.id}
      >
        <Box background={colors.white}>
          {isSmallerThanTablet ? (
            <IdeaShowPageTopBar idea={idea.data} phase={phase} />
          ) : (
            // 64px is the height of the CTA bar (see ParticipationCTAContent)
            <Box mt={showCTABar ? '64px' : undefined}>
              <DesktopTopBar project={project.data} />
            </Box>
          )}
          <Box mb="8px">
            <main id="e2e-idea-show">
              <StyledIdeasShow
                ideaId={idea.data.id}
                projectId={idea.data.relationships.project.data.id}
                compact={isSmallerThanTablet}
              />
            </main>
          </Box>
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
    </>
  );
};

export default IdeasShowPage;
