import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectEditTab from './admin/components/ProjectEditTab';
import SettingsTab from './admin/components/SettingsTab';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';

type RenderOnHideTabConditionProps = {
  project: IProjectData;
  phases: IPhaseData[] | null;
  children: ReactNode;
};

const RenderOnHideTabCondition = (props: RenderOnHideTabConditionProps) => {
  const { project, phases, children } = props;
  const processType = project.attributes.process_type;
  const participationMethod = project.attributes.participation_method;
  const hideTab =
    (processType === 'continuous' &&
      participationMethod !== 'ideation' &&
      participationMethod !== 'budgeting') ||
    (processType === 'timeline' &&
      !isNilOrError(phases) &&
      phases.filter((phase) => {
        return (
          phase.attributes.participation_method === 'ideation' ||
          phase.attributes.participation_method === 'budgeting'
        );
      }).length === 0);

  if (hideTab) {
    return null;
  }

  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects': [
      {
        path: '/:locale/admin/projects/:projectId/allowed-input-topics',
        name: 'topics',
        container: () => import('./admin/containers/ProjectAllowedInputTopics'),
      },
    ],
    'admin.settings': [
      {
        path: '/:locale/admin/settings/topics',
        name: 'admin topics index',
        container: () => import('./admin/containers/TopicsSettings/all'),
      },
      {
        path: '/:locale/admin/settings/topics/new',
        name: 'admin topics new',
        container: () => import('./admin/containers/TopicsSettings/New'),
      },
      {
        path: '/:locale/admin/settings/topics/:topicId/edit',
        name: 'admin topic edit',
        container: () => import('./admin/containers/TopicsSettings/Edit'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit': (props) => (
      <RenderOnHideTabCondition project={props.project} phases={props.phases}>
        <ProjectEditTab {...props} />
      </RenderOnHideTabCondition>
    ),
    'app.containers.Admin.settings.tabs': (props) => <SettingsTab {...props} />,
  },
};

export default configuration;
