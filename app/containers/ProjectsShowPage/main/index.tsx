import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

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
          clHistory.replace(redirectUrl);
        }
      }

      return null;
    }}
  </GetProject>
));
