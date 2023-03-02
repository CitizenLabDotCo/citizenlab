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

// hooks
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'hooks/useAuthUser';
import { useIntl } from 'utils/cl-intl';

// i18n
import messages from 'utils/messages';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

// typings
import { IProjectData } from 'services/projects';

// utils
import { isValidPhase } from './phaseParam';
import {
  anyIsUndefined,
  isNilOrError,
  isUnauthorizedError,
} from 'utils/helperUtils';
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

  const smallerThanMinTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const appConfig = useAppConfiguration();
  const phases = usePhases(projectId);

  const [search] = useSearchParams();
  const scrollToEventId = search.get('scrollToEventId');

  const { data: events } = useEvents({
    projectIds: projectId ? [projectId] : undefined,
    sort: '-start_at', // TODO: Clean up types, do the transformation in the fetcher instead.
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
          padding={smallerThanMinTablet ? '20px' : '0px'}
        >
          <EventsViewer
            showProjectFilter={false}
            projectId={projectId}
            eventsTime="currentAndFuture"
            title={formatMessage(messages.upcomingAndOngoingEvents)}
            fallbackMessage={messages.noUpcomingOrOngoingEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
          />
          <EventsViewer
            showProjectFilter={false}
            projectId={projectId}
            eventsTime="past"
            title={formatMessage(messages.pastEvents)}
            fallbackMessage={messages.noPastEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
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
  const project = useProject({ projectSlug: slug });
  const phases = usePhases(project?.id);
  const user = useAuthUser();

  const processType = project?.attributes?.process_type;
  const urlSegments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter((segment) => segment !== '');

  const projectPending = project === undefined;
  const userPending = user === undefined;
  const pending = projectPending || userPending;

  useEffect(() => {
    if (userPending) return;
    if (isError(user)) return;

    if (user !== null) setUserWasLoggedIn(true);
  }, [userPending, user]);

  if (pending) {
    return (
      <Centerer height="500px">
        <Spinner />
      </Centerer>
    );
  }

  const userJustLoggedOut = userWasLoggedIn && user === null;
  const unauthorized = isUnauthorizedError(project);

  if (userJustLoggedOut && unauthorized) {
    return <Navigate to="/" replace />;
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (isError(project)) {
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

  return <ProjectsShowPage project={project} />;
};

export default ProjectsShowPageWrapper;
