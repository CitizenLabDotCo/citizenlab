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

// const ContentWrapper = styled.div`
//   width: 100%;
//   max-width: 1285px;
//   padding-left: 50px;
//   padding-right: 50px;
// `;

const ProjectHeaderImage = styled.div<{ src: string | null | undefined }>`
  width: 100%;
  height: 250px;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border-radius: ${(props: any) => props.theme.borderRadius};
  margin-top: 40px;
  margin-bottom: 50px;
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

    let content = (
      <ContentContainer>
        <ProjectHeaderImage src={projectHeaderImageLarge} />
        {projectId && (
          <>
            <ProjectInfo projectId={projectId} />
            {showIdeas && <ProjectIdeas projectId={projectId} />}
          </>
        )}
      </ContentContainer>
    );

    if (loading) {
      content = (
        <LoadingWrapper>
          <Spinner />
        </LoadingWrapper>
      );
    }

    if (projectNotFound) {
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

const ProjectsShowPageWrapper = memo<WithRouterProps>(({ params }) => {
  const project = useProject({ projectSlug: params.slug });

  if (params.slug) {
    return (
      <ProjectsShowPage
        projectSlug={params.slug}
        project={!isNilOrError(project) ? project : undefined}
      />
    );
  }

  return null;
});

const ProjectsShowPageWrapperWithHoC = withRouter(ProjectsShowPageWrapper);

export default ProjectsShowPageWrapperWithHoC;
