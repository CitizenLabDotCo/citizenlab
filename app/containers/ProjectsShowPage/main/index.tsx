import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// services
import {  getProjectUrl } from 'services/projects';

// resources
import GetProject from 'resources/GetProject';

export default withRouter((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => {
      if (!isNilOrError(project)) {
        const redirectUrl = getProjectUrl(project);

        if (window.location.pathname !== redirectUrl) {
          browserHistory.replace(redirectUrl);
        }
      }

      return null;
    }}
  </GetProject>
));
