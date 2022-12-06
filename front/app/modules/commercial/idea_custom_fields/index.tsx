import React from 'react';
import { some } from 'lodash-es';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  getAllParticipationMethods,
  getMethodConfig,
} from 'utils/participationMethodUtils';

const Tab = React.lazy(() => import('./admin/components/Tab'));

const AdminProjectIdeaEditFormComponent = React.lazy(
  () => import('./admin/containers/projects/edit/ideaform')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects.project': [
      {
        path: 'ideaform',
        element: <AdminProjectIdeaEditFormComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit': (props) => {
      const { project, phases } = props;
      const allParticipationMethods = getAllParticipationMethods(
        project,
        phases
      );
      const showTab = some(
        allParticipationMethods,
        (method) => getMethodConfig(method).formEditor === 'simpleFormEditor'
      );
      if (showTab) {
        return (
          <div id="e2e-ideaform-settings-container">
            <Tab {...props} />
          </div>
        );
      }
      return null;
    },
  },
};

export default configuration;
