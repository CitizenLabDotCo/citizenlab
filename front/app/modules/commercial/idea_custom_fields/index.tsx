import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import {
  getAllParticipationMethods,
  getMethodConfig,
} from 'utils/participationMethodUtils';
import { some } from 'lodash-es';

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
        return <Tab {...props} />;
      }
      return null;
    },
  },
};

export default configuration;
