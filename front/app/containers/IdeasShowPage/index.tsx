import React from 'react';

import {
  Box,
  useBreakpoint,
  Spinner,
  stylingConsts,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

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

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

// note: StyledIdeasShow styles defined here should match that in PostPageFullscreenModal!
const StyledIdeasShow = styled(IdeasShow)<{ hasNextPreviousControl?: boolean }>`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${({ theme }) => media.tablet`
    margin-top: ${(props) =>
      props.hasNextPreviousControl ? '0' : theme.menuHeight}px;
    min-height: calc(100vh - ${theme.mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: ${(props) => (props.hasNextPreviousControl ? '0px' : '25px')};
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

  const [searchParams] = useSearchParams();
  const phaseContext = searchParams.get('phase_context');

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
    <>
      <IdeaMeta ideaId={idea.data.id} />
      <VotingContext
        projectId={project.data.id}
        phaseId={phaseContext || phase?.id}
      >
        <Box
          background={colors.white}
          pt={
            showCTABarAtTopOfPage ? `${stylingConsts.menuHeight}px` : undefined
          }
        >
          {isSmallerThanTablet ? (
            <StyledIdeaShowPageTopBar
              projectId={idea.data.relationships.project.data.id}
              ideaId={idea.data.id}
              phase={phase}
            />
          ) : (
            <DesktopTopBar project={project.data} />
          )}
          <>
            <Box mb="8px">
              {/* // Temporarily disable the IdeaNavigationButtons component until the performance related issues with it are fixed. */}
              {/* See https://www.notion.so/govocal/Investigate-the-FE-slowness-of-NHS-ideation-project-1289663b7b26802a99f9e480068a0471 */}
              {/* {phaseContext && (
                <Box
                  width="100%"
                  display="flex"
                  justifyContent="center"
                  mt={isSmallerThanTablet ? '68px ' : ''}
                >
                  <Box width="80px">
                    <IdeaNavigationButtons
                      projectId={project.data.id}
                      phaseContext={phaseContext}
                    />
                  </Box>
                </Box>
              )} */}

              <main id="e2e-idea-show">
                <StyledIdeasShow
                  ideaId={idea.data.id}
                  projectId={idea.data.relationships.project.data.id}
                  compact={isSmallerThanTablet}
                  hasNextPreviousControl={phaseContext !== null}
                />
              </main>
            </Box>
          </>
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
