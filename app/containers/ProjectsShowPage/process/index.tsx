import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Header from '../Header';
import Timeline from './Timeline';
import Phase from './Phase';
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

const StyledTimeline = styled(Timeline)`
  margin-top: -40px;
  position: relative;
`;

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 15px;
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

  constructor(props: Props) {
    super(props as any);
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

          <StyledTimeline projectId={project.id} onPhaseSelected={this.handleOnPhaseSelected} />

          <ProjectModeratorIndicator projectId={project.id} />

          {project.attributes.publication_status === 'archived' &&
            <StyledContentContainer>
              <Warning text={<FormattedMessage {...messages.archivedProject} />} />
            </StyledContentContainer>
          }

          {selectedPhaseId &&
            <Phase phaseId={selectedPhaseId} />
          }

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
