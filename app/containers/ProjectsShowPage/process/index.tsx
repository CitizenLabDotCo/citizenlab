import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import Timeline from './Timeline';
import Phase from './Phase';
import EventsPreview from '../EventsPreview';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledHeader = styled(Header)``;

const StyledTimeline = styled(Timeline)`
  margin-top: -40px;
  position: relative;
`;

const Mod = styled(ProjectModeratorIndicator)`
  max-width: ${props => props.theme.maxPageWidth}px;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedPhaseId: string | null;
}

class ProjectTimelinePage extends React.PureComponent<Props & WithRouterProps, State> {

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

    // const currentLocation = browserHistory.getCurrentLocation();
    // const currentPath = currentLocation.pathname;
    // const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);

    // if (lastUrlSegment === 'timeline') {
    //   browserHistory.push(`/projects/${this.props.params.slug}/process`);
    // }

    if (!isNilOrError(project)) {
      if (project.attributes.process_type !== 'timeline') {
        browserHistory.push(`/projects/${slug}/info`);
      }

      return (
        <Container className={className}>
          <StyledHeader projectSlug={slug} />

          <StyledTimeline projectId={project.id} onPhaseSelected={this.handleOnPhaseSelected} />

          <Mod projectId={project.id} displayType="message" />

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
