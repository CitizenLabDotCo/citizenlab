import * as React from 'react';

// components
import ProjectInfo from './ProjectInfo';

// style
import styled from 'styled-components';

type Props = {
  projectId: string;
};

type State = {};

const Container = styled.div`
  /* padding-bottom: 70px; */
`;

export default class ProjectInfoPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container>
        <ProjectInfo projectId={this.props.projectId} />
      </Container>
    );
  }
}
