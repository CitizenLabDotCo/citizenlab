import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Header from '../Header';
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import PBExpenses from '../pb/PBExpenses';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 50px;
  padding-bottom: 70px;
  background: ${colors.background};
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-bottom: 60px;
`;

const IdeasTitle = styled.h1`
  color: #333;
  font-size: ${fontSizes.xxxl}px;
  line-height: 35px;
  font-weight: 600;
  margin-bottom: 30px;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectTimelinePage extends PureComponent<Props & WithRouterProps, State> {

  render () {
    const { project, params } = this.props;

    if (!isNilOrError(project)) {
      if (project.attributes.process_type !== 'continuous') {
        // redirect
        clHistory.push(`/projects/${params.slug}`);
      } else {
        const isPBProject = (project.attributes.participation_method === 'budgeting');

        return (
          <>
            <Header projectSlug={params.slug} />
            <ProjectModeratorIndicator projectId={project.id} />
            <ProjectArchivedIndicator projectId={project.id} />
            <StyledContentContainer>
              {isPBProject &&
                <StyledPBExpenses
                  participationContextId={project.id}
                  participationContextType="Project"
                />
              }
              <IdeasTitle>
                <FormattedMessage {...messages.navIdeas} />
              </IdeasTitle>
              <IdeaCards
                type="load-more"
                sort="trending"
                pageSize={12}
                projectId={project.id}
                participationMethod={project.attributes.participation_method}
                participationContextId={project.id}
                participationContextType="Project"
                showViewToggle={true}
                defaultView={(project.attributes.presentation_mode || null)}
              />
            </StyledContentContainer>
            <EventsPreview projectId={project.id} />
          </>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => <GetProject slug={params.slug}>{render}</GetProject>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectTimelinePage {...inputProps} {...dataProps} />}
  </Data>
));
