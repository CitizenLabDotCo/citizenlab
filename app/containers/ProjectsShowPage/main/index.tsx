import React from 'react';
import { isNullOrError } from 'utils/helperUtils';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// components
import ProjectTimelinePage from '../process';
import ProjectInfoPage from '../info';

// services
import {  getProjectUrl } from 'services/projects';

// resources
import GetProject from 'resources/GetProject';

export default withRouter((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => {
      if (!isNullOrError(project)) {
        const redirectUrl = getProjectUrl(project);
        browserHistory.replace(redirectUrl);
        return project.attributes.process_type === 'timeline' ? <ProjectTimelinePage /> : <ProjectInfoPage />;
      }

      return null;
    }}
  </GetProject>
));
