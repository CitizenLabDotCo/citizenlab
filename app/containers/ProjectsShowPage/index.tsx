import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectHelmet from './ProjectHelmet';
import ProjectNotFound from './ProjectNotFound';
import ProjectHeader from './ProjectHeader';
import ProjectIdeas from './ProjectIdeas';
import ProjectSurvey from './ProjectSurvey';
import ProjectEvents from './ProjectEvents';
import ProjectTimelineContainer from './timeline';
import { Spinner } from 'cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IProjectData } from 'services/projects';

const Container = styled.main`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  project: IProjectData | Error | null | undefined;
}

const ProjectsShowPage = memo<Props>(({ project }) => {
  const projectId = !isNilOrError(project) ? project.id : undefined;
  const projectNotFound = isError(project);
  const processType = !isNilOrError(project)
    ? project.attributes.process_type
    : undefined;

  const locale = useLocale();
  const tenant = useTenant();
  const phases = usePhases(projectId);
  const events = useEvents(projectId);

  const loading =
    isUndefined(locale) ||
    isUndefined(tenant) ||
    isUndefined(project) ||
    isUndefined(phases) ||
    isUndefined(events);

  let content: JSX.Element | null = null;

  if (loading) {
    content = (
      <Loading>
        <Spinner />
      </Loading>
    );
  } else if (projectNotFound) {
    content = <ProjectNotFound />;
  } else if (projectId && processType) {
    content = (
      <>
        <ProjectHeader projectId={projectId} />
        {processType === 'continuous' ? (
          <>
            <ProjectIdeas projectId={projectId} />
            <ProjectSurvey projectId={projectId} />
          </>
        ) : (
          <ProjectTimelineContainer projectId={projectId} />
        )}
        <ProjectEvents projectId={projectId} />
      </>
    );
  }

  return (
    <Container>
      {!isNilOrError(project) && <ProjectHelmet project={project} />}
      {content}
    </Container>
  );
});

const ProjectsShowPageWrapper = memo<WithRouterProps>(
  ({ params: { slug } }) => {
    const project = useProject({ projectSlug: slug });

    if (slug) {
      return (
        <ProjectsShowPage
          project={!isNilOrError(project) ? project : undefined}
        />
      );
    }

    return null;
  }
);

const ProjectsShowPageWrapperWithHoC = withRouter(ProjectsShowPageWrapper);

export default ProjectsShowPageWrapperWithHoC;
