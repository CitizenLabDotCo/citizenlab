import React from 'react';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// components
import ProjectTimelinePage from '../process';
import ProjectInfoPage from '../info';

// services
import {  getProjectUrl } from 'services/projects';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectMainPage extends React.PureComponent<Props & WithRouterProps, State> {
  render() {
    const { project } = this.props;

    if (project) {
      const redirectUrl = getProjectUrl(project);
      browserHistory.replace(redirectUrl);
      return project.attributes.process_type === 'timeline' ? <ProjectTimelinePage /> : <ProjectInfoPage />;
    }

    return null;
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetProject slug={inputProps.params.slug}>
    {project => <ProjectMainPage {...inputProps} project={project} />}
  </GetProject>
));
