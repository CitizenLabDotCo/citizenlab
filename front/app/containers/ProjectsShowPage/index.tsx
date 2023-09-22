import React, { useEffect, useMemo, useState } from 'react';

// components
import ProjectHelmet from './shared/header/ProjectHelmet';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import ProjectHeader from './shared/header/ProjectHeader';
import ContinuousIdeas from './continuous/Ideas';
import ContinuousSurvey from './continuous/Survey';
import ContinuousDocumentAnnotation from './continuous/DocumentAnnotation';
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
import usePhases from 'api/phases/usePhases';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'api/me/useAuthUser';
import { useIntl } from 'utils/cl-intl';

// context
import { VotingContext } from 'api/baskets_ideas/useVoting';

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
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

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
  const processType = project.attributes.process_type;

  const isSmallerThanTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const { data: phases } = usePhases(projectId);

  const [search] = useSearchParams();
  const scrollToEventId = search.get('scrollToEventId');

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
    if (scrollToEventId && mounted && !loading) {
      setTimeout(() => {
        scrollToElement({ id: scrollToEventId });
        removeSearchParams(['scrollToEventId']);
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
  } else {
    content = (
      <ContentWrapper id="e2e-project-page">
        <ProjectHeader projectId={projectId} />
        <ProjectCTABar projectId={projectId} />

        <div id="participation-detail">
          {processType === 'continuous' ? (
            <>
              <ContinuousIdeas projectId={projectId} />
              {project.attributes.participation_method === 'survey' && (
                <ContinuousSurvey project={project} />
              )}
              {project.attributes.participation_method ===
                'document_annotation' && (
                <ContinuousDocumentAnnotation project={project} />
              )}
              <ContinuousPoll projectId={projectId} />
              <ContinuousVolunteering projectId={projectId} />
            </>
          ) : (
            <TimelineContainer projectId={projectId} />
          )}
        </div>
        {!!events?.data.length && (
          <Box
            id="e2e-events-section-project-page"
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
              hideSectionIfNoEvents={true}
              projectPublicationStatuses={['published', 'draft', 'archived']}
            />
            <EventsViewer
              showProjectFilter={false}
              projectId={projectId}
              eventsTime="past"
              title={formatMessage(messages.pastEvents)}
              fallbackMessage={messages.noPastEvents}
              hideSectionIfNoEvents={true}
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
  const [userWasLoggedIn, setUserWasLoggedIn] = useState(false);

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
  const processType = project?.data.attributes?.process_type;
  const urlSegments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter((segment) => segment !== '');
  const pending =
    isInitialProjectLoading || isUserLoading || isInitialPhasesLoading;

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
    processType === 'timeline' &&
    phases &&
    urlSegments.length === 4 &&
    isValidPhase(phaseNumber, phases.data);

  if (
    urlSegments[1] === 'projects' &&
    urlSegments.length > 3 &&
    !isTimelineProjectAndHasValidPhaseParam
  ) {
    // Redirect old childRoutes (e.g. /info, /process, ...) to the project index location
    const projectRoot = `/${urlSegments.slice(1, 3).join('/')}`;
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
