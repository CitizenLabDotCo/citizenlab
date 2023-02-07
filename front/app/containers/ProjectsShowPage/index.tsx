import React, { memo, useEffect, useMemo, useState } from 'react';

// components
import ProjectHelmet from './shared/header/ProjectHelmet';
import ProjectNotFound from './shared/header/ProjectNotFound';
import ProjectNotVisible from './shared/header/ProjectNotVisible';
import ProjectHeader from './shared/header/ProjectHeader';
import ContinuousIdeas from './continuous/Ideas';
import ContinuousSurvey from './continuous/Survey';
import ContinuousPoll from './continuous/Poll';
import ContinuousVolunteering from './continuous/Volunteering';
import TimelineContainer from './timeline';
import { Box, Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';
import Redirect from 'components/routing/Redirect';
import Modal from './Modal';
import { ProjectCTABar } from './ProjectCTABar';
import EventsViewer from 'containers/EventsPage/EventsViewer';

// hooks
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';
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
import { anyIsUndefined, isNilOrError, isApiError } from 'utils/helperUtils';
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

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

interface Props {
  project: IProjectData | Error | null | undefined;
  scrollToEventId?: string;
}

const ProjectsShowPage = memo<Props>(({ project, scrollToEventId }) => {
  const projectId = !isNilOrError(project) ? project.id : undefined;
  const projectNotFound = isError(project);
  const processType = !isNilOrError(project)
    ? project.attributes.process_type
    : undefined;

  const smallerThanMinTablet = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const appConfig = useAppConfiguration();
  const phases = usePhases(projectId);

  const { events } = useEvents({
    projectIds: projectId ? [projectId] : undefined,
    sort: 'newest',
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

  const user = useAuthUser();

  const isUnauthorized = useMemo(() => {
    if (!isApiError(project)) return false;

    return project.json.errors?.base[0].error === 'Unauthorized!';
  }, [project]);

  const userSignedInButUnauthorized = !isNilOrError(user) && isUnauthorized;
  const userNotSignedInAndUnauthorized = isNilOrError(user) && isUnauthorized;

  let content: JSX.Element | null = null;

  if (userNotSignedInAndUnauthorized) {
    return <Redirect method="push" path="/" />;
  }

  if (userSignedInButUnauthorized) {
    content = <ProjectNotVisible />;
  } else if (loading) {
    content = (
      <Loading>
        <Spinner />
      </Loading>
    );
  } else if (projectNotFound) {
    content = <ProjectNotFound />;
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
            projectIds={[projectId]}
            eventsTime="currentAndFuture"
            title={formatMessage(messages.upcomingAndOngoingEvents)}
            fallbackMessage={messages.noUpcomingOrOngoingEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
          />
          <EventsViewer
            showProjectFilter={false}
            projectIds={[projectId]}
            eventsTime="past"
            title={formatMessage(messages.pastEvents)}
            fallbackMessage={messages.noPastEvents}
            onClickTitleGoToProjectAndScrollToEvent={false}
            hideSectionIfNoEvents={true}
          />
        </Box>
        <Modal projectId={projectId} />
      </ContentWrapper>
    );
  }

  const bgColor =
    !isNilOrError(events) && events.length > 0 ? '#fff' : colors.background;

  return (
    <Container background={bgColor}>
      {!isNilOrError(project) && <ProjectHelmet project={project} />}
      {content}
    </Container>
  );
});

const ProjectsShowPageWrapper = () => {
  const { pathname } = useLocation();
  const { slug, phaseNumber } = useParams();
  const [search] = useSearchParams();
  const scrollToEventId = search.get('scrollToEventId');

  const project = useProject({ projectSlug: slug });
  const phases = usePhases(project?.id);
  const processType = project?.attributes?.process_type;

  const urlSegments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter((segment) => segment !== '');

  if (
    processType === 'timeline' &&
    urlSegments.length === 4 &&
    !isNilOrError(phases) &&
    isValidPhase(phaseNumber, phases)
  ) {
    // If this is a timeline project and a valid phase param was passed: continue
    return <ProjectsShowPage project={project} />;
  } else if (scrollToEventId) {
    // If an event id was passed as a query param, pass it on
    return (
      <ProjectsShowPage project={project} scrollToEventId={scrollToEventId} />
    );
  } else if (urlSegments.length > 3 && urlSegments[1] === 'projects') {
    // Redirect old childRoutes (e.g. /info, /process, ...) to the project index location
    const projectRoot = `/${urlSegments.slice(1, 3).join('/')}`;
    return <Redirect method="replace" path={projectRoot} />;
  } else if (slug) {
    return <ProjectsShowPage project={project} />;
  }

  return null;
};
export default ProjectsShowPageWrapper;
