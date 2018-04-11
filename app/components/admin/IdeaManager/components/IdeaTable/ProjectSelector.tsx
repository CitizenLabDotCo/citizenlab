import React from 'react';
import { Label } from 'semantic-ui-react';
import T from 'components/T';
import GetProject, { GetProjectChildProps } from 'utils/resourceLoaders/components/GetProject';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps, GetProjectChildProps {}

interface State {}

class ProjectSelector extends React.PureComponent<Props, State> {
  render() {
    const { project } = this.props;

    if (!project) return null;

    return (
      <Label
        key={project.id}
        color="teal"
        basic={true}
      >
        <T value={project.attributes.title_multiloc} />
      </Label>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {getProjectChildProps => <ProjectSelector {...inputProps} {...getProjectChildProps} />}
  </GetProject>
);
