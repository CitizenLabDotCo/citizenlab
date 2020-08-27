import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import PBExpenses from '../pb/PBExpenses';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, media, viewportWidths } from 'utils/styleUtils';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  padding-top: 30px;
  background: ${colors.background};
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 50px;
  padding-bottom: 100px;
  background: ${colors.background};

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-bottom: 60px;
  padding: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};

  ${media.smallerThanMaxTablet`
    padding: 20px;
  `}
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectTimelinePage extends PureComponent<
  Props & WithRouterProps,
  State
> {
  render() {
    const { project, params, windowSize } = this.props;
    const smallerThanBigTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;

    if (!isNilOrError(project)) {
      if (project.attributes.process_type !== 'continuous') {
        // redirect
        clHistory.push(`/projects/${params.slug}`);
      } else {
        const isPBProject =
          project.attributes.participation_method === 'budgeting';
        const projectId = project.id;
        const projectIds = [projectId];

        return (
          <>
            <StyledProjectArchivedIndicator projectId={projectId} />
            <StyledContentContainer id="e2e-project-ideas-page">
              {isPBProject && (
                <StyledPBExpenses
                  participationContextId={projectId}
                  participationContextType="project"
                  viewMode={smallerThanBigTablet ? 'column' : 'row'}
                />
              )}
              <IdeaCards
                type="load-more"
                projectIds={projectIds}
                participationMethod={project.attributes.participation_method}
                participationContextId={projectId}
                participationContextType="project"
                showViewToggle={true}
                defaultView={project.attributes.presentation_mode || null}
                invisibleTitleMessage={messages.invisibleTitleIdeasList}
              />
            </StyledContentContainer>
            <EventsPreview projectId={projectId} />
          </>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  windowSize: <GetWindowSize />,
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectTimelinePage {...inputProps} {...dataProps} />}
  </Data>
));
