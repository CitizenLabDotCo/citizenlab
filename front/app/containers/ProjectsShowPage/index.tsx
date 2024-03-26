import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Spinner,
  useBreakpoint,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import JSConfetti from 'js-confetti';
import { isError } from 'lodash-es';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { VotingContext } from 'api/baskets_ideas/useVoting';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocale from 'hooks/useLocale';

import EventsViewer from 'containers/EventsPage/EventsViewer';

import ErrorBoundary from 'components/ErrorBoundary';
import PageNotFound from 'components/PageNotFound';
import Centerer from 'components/UI/Centerer';
import Unauthorized from 'components/Unauthorized';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { anyIsUndefined, isNilOrError } from 'utils/helperUtils';
import messages from 'utils/messages';
import { scrollToElement } from 'utils/scroll';

import { isValidPhase } from './phaseParam';
import ProjectCTABar from './ProjectCTABar';
import ProjectHeader from './shared/header/ProjectHeader';
import ProjectHelmet from './shared/header/ProjectHelmet';
import { maxPageWidth } from './styles';
import SuccessModal from './SucessModal';
import TimelineContainer from './timeline';

const confetti = new JSConfetti();

const Container = styled.main<{ background: string }>`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background};

  ${media.tablet`
    min-height: calc(100vh - ${({ theme: { mobileMenuHeight } }) =>
      mobileMenuHeight}px - ${({ theme: { mobileTopBarHeight } }) =>
    mobileTopBarHeight}px);
  `}

  ${media.phone`
    min-height: calc(100vh - ${({ theme: { mobileMenuHeight } }) =>
      mobileMenuHeight}px - ${({ theme: { mobileTopBarHeight } }) =>
    mobileTopBarHeight}px);
  `}
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

  const [search] = useSearchParams();
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

  let content: JSX.Element | null = null;

  if (loading) {
    content = (
      <Centerer flex="1 0 auto" height="500px">
        <Spinner />
      </Centerer>
    );
  } else {
    content = (
      <ContentWrapper id="e2e-project-page">
        <ProjectHeader projectId={projectId} />
        <ProjectCTABar projectId={projectId} />

        <div id="participation-detail">
          <TimelineContainer projectId={projectId} />
        </div>
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
              projectPublicationStatuses={['published', 'draft', 'archived']}
            />
            <EventsViewer
              showProjectFilter={false}
              projectId={projectId}
              eventsTime="past"
              title={formatMessage(messages.pastEvents)}
              fallbackMessage={messages.noPastEvents}
              projectPublicationStatuses={['published', 'draft', 'archived']}
              showDateFilter={false}
            />
          </Box>
        )}

        <SuccessModal projectId={projectId} />
      </ContentWrapper>
    );
  }

  const bgColor =
    !isNilOrError(events) && events.data.length > 0
      ? '#fff'
      : colors.background;

  return (
    <Container background={bgColor}>
      <ProjectHelmet project={project} />
      {content}
    </Container>
  );
};

const ProjectsShowPageWrapper = () => {
  const { pathname } = useLocation();
  const { slug, phaseNumber } = useParams();
  const {
    data: project,
    status: statusProject,
    error,
    isInitialLoading: isInitialProjectLoading,
  } = useProjectBySlug(slug);
  const { data: phases, isInitialLoading: isInitialPhasesLoading } = usePhases(
    project?.data.id
  );
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const urlSegments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter((segment) => segment !== '');
  const pending =
    isInitialProjectLoading || isUserLoading || isInitialPhasesLoading;

  const [userWasLoggedIn, setUserWasLoggedIn] = useState(false);

  useEffect(() => {
    if (pending) return;
    if (isError(user)) return;

    if (user) setUserWasLoggedIn(true);
  }, [pending, user]);

  if (pending) {
    return (
      <Centerer height="500px">
        <Spinner />
      </Centerer>
    );
  }

  const userJustLoggedOut = userWasLoggedIn && user === null;
  const unauthorized = statusProject === 'error' && isUnauthorizedRQ(error);

  if (userJustLoggedOut && unauthorized) {
    return <Navigate to="/" replace />;
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (statusProject === 'error' || project === null) {
    return <PageNotFound />;
  }

  const isTimelineProjectAndHasValidPhaseParam =
    phases &&
    urlSegments.length === 4 &&
    isValidPhase(phaseNumber, phases.data);

  if (
    urlSegments[1] === 'projects' &&
    urlSegments.length > 3 &&
    !isTimelineProjectAndHasValidPhaseParam
  ) {
    // Redirect old childRoutes (e.g. /info, /process, ...) to the project index location
    const projectRoot = `/${urlSegments.slice(1, 3).join('/')}` as RouteType;
    return <Navigate to={projectRoot} replace />;
  }

  if (!project) return null;

  return (
    <VotingContext projectId={project.data.id}>
      <ProjectsShowPage project={project.data} />
    </VotingContext>
  );
};

export default () => (
  <ErrorBoundary>
    <ProjectsShowPageWrapper />
  </ErrorBoundary>
);
