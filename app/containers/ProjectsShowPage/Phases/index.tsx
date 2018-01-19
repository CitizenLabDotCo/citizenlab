import * as React from 'react';

// components
import Timeline from './Timeline';
import Phase from './Phase';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledTimeline = styled(Timeline)`
  display: none;
`;

type Props = {
  projectId: string
};

type State = {
  phaseId: string | null;
};

export default class ProjectPhasesPage extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      phaseId: null
    };
  }

  handleOnPhaseClick = (phaseId: string | null) => {
    this.setState({ phaseId });
  }

  render() {
    const className = this.props['className'];
    const { projectId } = this.props;
    const { phaseId } = this.state;

    if (projectId) {
      return (
        <Container className={className}>
          <StyledTimeline projectId={projectId} onPhaseClick={this.handleOnPhaseClick} />
          {phaseId && <Phase phaseId={phaseId} />}
        </Container>
      );
    }

    return null;
  }
}
