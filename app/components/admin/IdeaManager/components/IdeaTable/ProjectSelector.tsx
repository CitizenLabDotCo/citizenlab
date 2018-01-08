import * as React from 'react';

import { InjectedResourceLoaderProps, injectResource } from 'utils/resourceLoaders/resourceLoader';
import { projectByIdStream, IProjectData } from 'services/projects';

import { Label } from 'semantic-ui-react';
import T from 'components/T';

type Props = {
  project: IProjectData,
};

class ProjectSelector extends React.PureComponent<Props & InjectedResourceLoaderProps<IProjectData>> {

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

export default injectResource('project', projectByIdStream, (props) => props.selectedProject)(ProjectSelector);
