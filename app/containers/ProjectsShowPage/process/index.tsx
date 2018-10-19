import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Header from '../Header';
import Timeline from './Timeline';
import PhaseAbout from './PhaseAbout';
import PhaseAttachments from './PhaseAttachments';
import PhaseExpenses from './PhaseExpenses';
import PhaseSurvey from './PhaseSurvey';
import PhaseIdeas from './PhaseIdeas';
import EventsPreview from '../EventsPreview';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';
import Warning from 'components/UI/Warning';
import ContentContainer from 'components/ContentContainer';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import messages from '../../Admin/pages/messages';

const Container = styled.div``;

const StyledPhaseAbout = styled(PhaseAbout)`
  margin-bottom: 25px;
`;

const StyledPhaseAttachments = styled(PhaseAttachments)`
  margin-bottom: 25px;
`;

const StyledPhaseExpenses = styled(PhaseExpenses)`
  margin-bottom: 25px;
`;

const StyledPhaseSurvey = styled(PhaseSurvey)``;

const StyledPhaseIdeas = styled(PhaseIdeas)`
  margin-bottom: 25px;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedPhaseId: string | null;
}

class ProjectTimelinePage extends PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhaseId: null
    };
  }

  handleOnPhaseSelected = (selectedPhaseId: string | null) => {
    this.setState({ selectedPhaseId });
  }

  render() {
    const className = this.props['className'];
    const { project } = this.props;
    const { slug } = this.props.params;
    const { selectedPhaseId } = this.state;

    if (!isNilOrError(project)) {
      if (project.attributes.process_type !== 'timeline') {
        clHistory.push(`/projects/${slug}/info`);
      }

      return (
        <Container className={className}>
          <Header projectSlug={slug} />

          <Timeline projectId={project.id} onPhaseSelected={this.handleOnPhaseSelected} />

          <ProjectModeratorIndicator projectId={project.id} />

          <ContentContainer>
            {project.attributes.publication_status === 'archived' &&
              <Warning text={<FormattedMessage {...messages.archivedProject} />} />
            }
            <StyledPhaseAbout phaseId={selectedPhaseId} />
            <StyledPhaseAttachments phaseId={selectedPhaseId} />
            <StyledPhaseExpenses phaseId={selectedPhaseId} />
            <StyledPhaseSurvey phaseId={selectedPhaseId} />
            <StyledPhaseIdeas phaseId={selectedPhaseId} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </Container>
      );
    }

    return null;
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetProject slug={inputProps.params.slug}>
    {project => <ProjectTimelinePage {...inputProps} project={project} />}
  </GetProject>
));
