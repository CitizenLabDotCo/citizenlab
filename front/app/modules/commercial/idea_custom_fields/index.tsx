import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';
import {
  getAllParticipationMethods,
  getMethodConfig,
} from 'utils/participationMethodUtils';
import { some } from 'lodash-es';

const AdminProjectIdeaEditFormComponent = React.lazy(
  () => import('./admin/containers/projects/edit/ideaform')
);

type RenderIfSimpleFormEditorProps = {
  project: IProjectData;
  phases: IPhaseData[] | null;
  children: ReactNode;
};

const RenderIfSimpleFormEditor = (props: RenderIfSimpleFormEditorProps) => {
  const { project, phases, children } = props;

  const allParticipationMethods = getAllParticipationMethods(project, phases);

  const showTab = some(
    allParticipationMethods,
    (method) => getMethodConfig(method).formEditor === 'simpleFormEditor'
  );

  if (showTab) {
    return <>{children}</>;
  }

  return null;
};

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
      return (
        <RenderIfSimpleFormEditor project={props.project} phases={props.phases}>
          <Tab {...props} />
        </RenderIfSimpleFormEditor>
      );
    },
  },
};

export default configuration;
