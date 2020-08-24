import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectsShowPageMeta from './ProjectsShowPageMeta';
import ContentContainer from 'components/ContentContainer';
import Button from 'components/UI/Button';
import { Spinner } from 'cl2-component-library';
import ProjectInfo from './ProjectInfo';
import ProjectIdeas from './ProjectIdeas';
import ProjectEvents from './ProjectEvents';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

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

const LoadingWrapper = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectHeaderImage = styled.div<{ src: string }>`
  width: 100%;
  height: 220px;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border-radius: ${(props: any) => props.theme.borderRadius};
  margin-top: 40px;
  transform: translate3d(0, 0, 0);
`;

const ProjectNotFoundWrapper = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

const StyledProjectInfo = styled(ProjectInfo)`
  margin-top: 40px;
`;

const ProjectIdeasContentContainer = styled(ContentContainer)`
  padding-top: 60px;
  padding-bottom: 80px;
  background: ${colors.background};
  border-top: solid 1px #e8e8e8;
  border-bottom: solid 1px #e8e8e8;
`;

const ProjectEventsContentContainer = styled(ContentContainer)`
  padding-top: 60px;
  padding-bottom: 80px;
`;

const ProjectsShowPage = memo(
  ({
    project,
    projectSlug,
  }: {
    project: IProjectData | null | undefined;
    projectSlug: string;
  }) => {
    const locale = useLocale();
    const tenant = useTenant();
    const phases = usePhases(project?.id);
    const events = useEvents(project?.id);

    const projectNotFound = isError(project);
    const loading =
      isUndefined(locale) ||
      isUndefined(tenant) ||
      isUndefined(project) ||
      isUndefined(phases) ||
      isUndefined(events);
    // const currentPath = location.pathname;
    // const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
    const projectHeaderImageLarge = project?.attributes?.header_bg?.large;
    const projectId = project?.id;
    const projectType = project?.attributes.process_type;
    const participationMethod = project?.attributes.participation_method;
    const showIdeas = !!(
      projectType === 'continuous' &&
      (participationMethod === 'budgeting' ||
        participationMethod === 'ideation')
    );

    let content: JSX.Element | null = null;

    if (loading) {
      content = (
        <LoadingWrapper>
          <Spinner />
        </LoadingWrapper>
      );
    } else if (projectNotFound) {
      content = (
        <ProjectNotFoundWrapper>
          <p>
            <FormattedMessage {...messages.noProjectFoundHere} />
          </p>
          <Button
            linkTo="/projects"
            text={<FormattedMessage {...messages.goBackToList} />}
            icon="arrow-back"
          />
        </ProjectNotFoundWrapper>
      );
    } else if (projectId) {
      content = (
        <>
          <ContentContainer>
            {projectHeaderImageLarge && (
              <ProjectHeaderImage src={projectHeaderImageLarge} />
            )}
            <StyledProjectInfo projectId={projectId} />
          </ContentContainer>
          {showIdeas && (
            <ProjectIdeasContentContainer id="project-ideas">
              <ProjectIdeas projectId={projectId} />
            </ProjectIdeasContentContainer>
          )}
          <ProjectEventsContentContainer id="project-events">
            <ProjectEvents projectId={projectId} />
          </ProjectEventsContentContainer>
        </>
      );
    }

    return (
      <Container>
        {projectSlug && !projectNotFound && (
          <ProjectsShowPageMeta projectSlug={projectSlug} />
        )}
        {content}
      </Container>
    );
  }
);

const ProjectsShowPageWrapper = memo<WithRouterProps>(
  ({ params: { slug } }) => {
    const project = useProject({ projectSlug: slug });

    if (slug) {
      return (
        <ProjectsShowPage
          projectSlug={slug}
          project={!isNilOrError(project) ? project : undefined}
        />
      );
    }

    return null;
  }
);

const ProjectsShowPageWrapperWithHoC = withRouter(ProjectsShowPageWrapper);

export default ProjectsShowPageWrapperWithHoC;
