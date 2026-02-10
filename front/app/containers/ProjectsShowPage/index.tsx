import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  useBreakpoint,
  media,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import JSConfetti from 'js-confetti';
import { isError } from 'lodash-es';
import { useParams, useSearch } from 'utils/router';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { VotingContext } from 'api/baskets_ideas/useVoting';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocale from 'hooks/useLocale';

import EventsViewer from 'containers/EventsPage/EventsViewer';

import ErrorBoundary from 'components/ErrorBoundary';
import PageNotFound from 'components/PageNotFound';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import Unauthorized from 'components/Unauthorized';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { anyIsUndefined } from 'utils/helperUtils';
import messages from 'utils/messages';
import { scrollToElement } from 'utils/scroll';

import ProjectCTABar from './ProjectCTABar';
import ProjectHeader from './shared/header/ProjectHeader';
import ProjectShowPageMeta from './shared/header/ProjectShowPageMeta';
import { maxPageWidth } from './styles';
import SuccessModal from './SucessModal';
import TimelineContainer from './timeline';

const confetti = new JSConfetti();

const Container = styled.div<{ background: string }>`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(
    100vh - ${stylingConsts.menuHeight + stylingConsts.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background};

  ${media.tablet`
    min-height: calc(100vh - ${stylingConsts.mobileMenuHeight}px - ${stylingConsts.mobileTopBarHeight}px);`}
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

interface Props {
  project: IProjectData;
}

const ProjectsShowPage = ({ project }: Props) => {
  const projectId = project.id;
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const { data: phases } = usePhases(projectId);

  const [search] = useSearch({ strict: false });
  const scrollToStatusModule = search.get('scrollToStatusModule');
  const scrollToIdeas = search.get('scrollToIdeas');

  const { data: events } = useEvents({
    projectIds: [projectId],
    sort: '-start_at',
  });

  const loading = useMemo(() => {
    return anyIsUndefined(locale, appConfig, project, phases?.data, events);
  }, [locale, appConfig, project, phases, events]);

  // Check that all child components are mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // UseEffect to scroll to event when provided
  useEffect(() => {
    if (scrollToStatusModule && mounted && !loading) {
      setTimeout(() => {
        scrollToElement({ id: 'voting-status-module' });
        confetti.addConfetti();
        removeSearchParams(['scrollToStatusModule']);
      }, 500);
    }

    if (scrollToIdeas && mounted && !loading) {
      setTimeout(() => {
        scrollToElement({ id: 'e2e-ideas-container' });
        removeSearchParams(['scrollToIdeas']);
      }, 1000);
    }
  }, [mounted, loading, scrollToStatusModule, scrollToIdeas]);

  return (
    <main id="e2e-project-page">
      <Container
        background={
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          events && events?.data.length > 0 ? colors.white : colors.background
        }
      >
        {loading ? (
          <FullPageSpinner />
        ) : (
          <ContentWrapper>
            <ProjectHeader projectId={projectId} />
            <ProjectCTABar projectId={projectId} />

            <TimelineContainer projectId={projectId} />
            {!!events?.data.length && (
              <Box
                id="e2e-events-section-project-page"
                display="flex"
                flexDirection="column"
                gap="48px"
                mx="auto"
                my="48px"
                maxWidth={`${maxPageWidth}px`}
                padding={isSmallerThanTablet ? '20px' : '0px'}
              >
                <EventsViewer
                  showProjectFilter={false}
                  projectId={projectId}
                  eventsTime="currentAndFuture"
                  title={formatMessage(messages.upcomingAndOngoingEvents)}
                  fallbackMessage={messages.noUpcomingOrOngoingEvents}
                  projectPublicationStatuses={[
                    'published',
                    'draft',
                    'archived',
                  ]}
                />
                <EventsViewer
                  showProjectFilter={false}
                  projectId={projectId}
                  eventsTime="past"
                  title={formatMessage(messages.pastEvents)}
                  fallbackMessage={messages.noPastEvents}
                  projectPublicationStatuses={[
                    'published',
                    'draft',
                    'archived',
                  ]}
                  showDateFilter={false}
                />
              </Box>
            )}
            <SuccessModal projectId={projectId} />
          </ContentWrapper>
        )}
      </Container>
    </main>
  );
};

const ProjectsShowPageWrapper = () => {
  const { slug, phaseNumber } = useParams({
    from: '/$locale/projects/$slug/$phaseNumber',
  });
  const {
    data: project,
    status: statusProject,
    error,
    isInitialLoading: isInitialProjectLoading,
  } = useProjectBySlug(slug);
  const { data: phases, isInitialLoading: isInitialPhasesLoading } = usePhases(
    project?.data.id
  );
  const phaseIndex = phaseNumber ? parseInt(phaseNumber, 10) - 1 : undefined;

  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const pending =
    isInitialProjectLoading || isUserLoading || isInitialPhasesLoading;

  const [userWasLoggedIn, setUserWasLoggedIn] = useState(false);

  useEffect(() => {
    if (pending) return;
    if (isError(user)) return;

    if (user) setUserWasLoggedIn(true);
  }, [pending, user]);

  if (pending) {
    return <FullPageSpinner />;
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const userJustLoggedOut = userWasLoggedIn && user === null;
  const unauthorized = statusProject === 'error' && isUnauthorizedRQ(error);

  if (userJustLoggedOut && unauthorized) {
    return <Navigate to="/" replace />;
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (statusProject === 'error' || project === null) {
    return <PageNotFound />;
  }

  if (!project) return null;

  return (
    <>
      <ProjectShowPageMeta project={project.data} />
      <VotingContext
        projectId={project.data.id}
        phaseId={
          phaseIndex
            ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              phases?.data?.[phaseIndex]?.id
            : phases?.data && getLatestRelevantPhase(phases.data)?.id
        }
      >
        <ProjectsShowPage project={project.data} />
      </VotingContext>
    </>
  );
};

export default () => (
  <ErrorBoundary>
    <ProjectsShowPageWrapper />
  </ErrorBoundary>
);
