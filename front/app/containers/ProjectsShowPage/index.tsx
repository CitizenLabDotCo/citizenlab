import React, { useEffect, useMemo, useState } from 'react';

// components
import ProjectHelmet from './shared/header/ProjectHelmet';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import ProjectHeader from './shared/header/ProjectHeader';
import ContinuousIdeas from './continuous/Ideas';
import ContinuousSurvey from './continuous/Survey';
import ContinuousPoll from './continuous/Poll';
import ContinuousVolunteering from './continuous/Volunteering';
import TimelineContainer from './timeline';
import { Box, Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';
import Navigate from 'utils/cl-router/Navigate';
import SuccessModal from './SucessModal';
import { ProjectCTABar } from './ProjectCTABar';
import EventsViewer from 'containers/EventsPage/EventsViewer';
import Centerer from 'components/UI/Centerer';
import ErrorBoundary from 'components/ErrorBoundary';

// hooks
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'hooks/usePhases';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'hooks/useAuthUser';
import { useIntl } from 'utils/cl-intl';

// events
import eventEmitter from 'utils/eventEmitter';

// i18n
import messages from 'utils/messages';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';

// utils
import { isValidPhase } from './phaseParam';
import { anyIsUndefined, isNilOrError } from 'utils/helperUtils';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { scrollToElement } from 'utils/scroll';
import { isError } from 'lodash-es';

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
  project: IProjectData | Error | null;
}

const ProjectsShowPage = ({ project }: Props) => {
  const projectId = !isNilOrError(project) ? project.id : undefined;
  const processType = !isNilOrError(project)
    ? project.attributes.process_type
    : undefined;

  const isSmallerThanTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const phases = usePhases(projectId);

  const [search] = useSearchParams();
  const scrollToEventId = search.get('scrollToEventId');

  const { data: events } = useEvents({
    projectIds: projectId ? [projectId] : undefined,
    sort: '-start_at',
  });

  const loading = useMemo(() => {
    return anyIsUndefined(locale, appConfig, project, phases, events);
  }, [locale, appConfig, project, phases, events]);

  // Check that all child components are mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // UseEffect to scroll to event when provided
  useEffect(() => {
    if (scrollToEventId && mounted && !loading) {
      setTimeout(() => {
        scrollToElement({ id: scrollToEventId });
      }, 2000);
    }
  }, [mounted, loading, scrollToEventId]);

  let content: JSX.Element | null = null;

  if (loading) {
    content = (
      <Centerer flex="1 0 auto" height="500px">
        <Spinner />
      </Centerer>
    );
  } else if (projectId && processType) {
    content = (
      <ContentWrapper id="e2e-project-page">
        <ProjectHeader projectId={projectId} />
        <ProjectCTABar projectId={projectId} />
        <div id="participation-detail">
          {processType === 'continuous' ? (
            <>
              <ContinuousIdeas projectId={projectId} />
              <ContinuousSurvey projectId={projectId} />
              <ContinuousPoll projectId={projectId} />
              <ContinuousVolunteering projectId={projectId} />
            </>
          ) : (
            <TimelineContainer projectId={projectId} />
          )}
        </div>
        <Box
          display="flex"
          flexDirection="column"
          gap="48px"
          mx="auto"
          my="48px"
          maxWidth="1166px"
          padding={isSmallerThanTablet ? '20px' : '0px'}
        >
          <EventsViewer
            showProjectFilter={false}
            projectId={projectId}
            eventsTime="currentAndFuture"
            title={formatMessage(messages.upcomingAndOngoingEvents)}
            fallbackMessage={messages.noUpcomingOrOngoingEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
            projectPublicationStatuses={['published', 'draft', 'archived']}
          />
          <EventsViewer
            showProjectFilter={false}
            projectId={projectId}
            eventsTime="past"
            title={formatMessage(messages.pastEvents)}
            fallbackMessage={messages.noPastEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
            projectPublicationStatuses={['published', 'draft', 'archived']}
          />
        </Box>
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
      {!isNilOrError(project) && <ProjectHelmet project={project} />}
      {content}
    </Container>
  );
};

const ProjectsShowPageWrapper = () => {
  const [userWasLoggedIn, setUserWasLoggedIn] = useState(false);

  const { pathname } = useLocation();
  const { slug, phaseNumber } = useParams();
  const { data: project, status, error, refetch } = useProjectBySlug(slug);
  const phases = usePhases(project?.data.id);
  const user = useAuthUser();

  const processType = project?.data.attributes?.process_type;
  const urlSegments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter((segment) => segment !== '');

  const projectPending = status === 'loading';
  const userPending = user === undefined;
  const pending = projectPending || userPending;

  useEffect(() => {
    if (pending) return;
    if (isError(user)) return;

    if (user !== null) setUserWasLoggedIn(true);
  }, [pending, user]);

  useEffect(() => {
    eventEmitter.observeEvent('resetQueryCache').subscribe(() => {
      refetch();
    });
  }, [refetch]);

  if (pending) {
    return (
      <Centerer height="500px">
        <Spinner />
      </Centerer>
    );
  }

  const userJustLoggedOut = userWasLoggedIn && user === null;
  const unauthorized = status === 'error' && isUnauthorizedRQ(error);

  if (userJustLoggedOut && unauthorized) {
    return <Navigate to="/" replace />;
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (status === 'error') {
    return <PageNotFound />;
  }

  const isTimelineProjectAndHasValidPhaseParam =
    processType === 'timeline' &&
    !isNilOrError(phases) &&
    urlSegments.length === 4 &&
    isValidPhase(phaseNumber, phases);

  if (
    urlSegments[1] === 'projects' &&
    urlSegments.length > 3 &&
    !isTimelineProjectAndHasValidPhaseParam
  ) {
    // Redirect old childRoutes (e.g. /info, /process, ...) to the project index location
    const projectRoot = `/${urlSegments.slice(1, 3).join('/')}`;
    // return <Redirect method="replace" path={projectRoot} />;
    return <Navigate to={projectRoot} replace />;
  }

  if (!project) return null;

  return <ProjectsShowPage project={project.data} />;
};

export default () => (
  <ErrorBoundary>
    <ProjectsShowPageWrapper />
  </ErrorBoundary>
);
