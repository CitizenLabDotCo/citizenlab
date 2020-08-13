import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectsShowPageMeta from './ProjectsShowPageMeta';
import Header from './Header';
import Button from 'components/UI/Button';
import { Spinner } from 'cl2-component-library';

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
  background: #fff;

  &.greyBackground {
    background: ${colors.background};
  }

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
    background: ${colors.background};
  `}

  ${media.biggerThanMinTablet`
    &.loaded {
      min-height: 900px;
    }
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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

interface Props {
  project: IProjectData | null | undefined;
  projectSlug: string;
}

const ProjectsShowPage = memo<Props>(({ project, projectSlug }) => {
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
  const currentPath = location.pathname;
  const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);

  return (
    <>
      <ProjectsShowPageMeta projectSlug={projectSlug} />
      <Container
        className={`${
          lastUrlSegment === 'events' || lastUrlSegment === 'info'
            ? 'greyBackground'
            : ''
        } ${!loading ? 'loaded' : 'loading'}`}
      >
        {projectNotFound ? (
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
        ) : loading ? (
          <Loading>
            <Spinner />
          </Loading>
        ) : (
          <>
            <Header projectSlug={projectSlug} />
            <div>Test</div>
            {/* <Content>{children}</Content> */}
          </>
        )}
      </Container>
    </>
  );
});

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
