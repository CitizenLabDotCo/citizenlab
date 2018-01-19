import * as React from 'react';

// components
import ProjectInfo from './ProjectInfo';

type Props = {
  projectId: string;
};

type State = {};

export default class ProjectInfoPage extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { projectId } = this.props;

    return (
      <>
        <ProjectInfo projectId={projectId} />
      </>
    );
  }
}
