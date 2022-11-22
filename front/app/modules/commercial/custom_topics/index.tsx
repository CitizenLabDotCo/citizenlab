import React, { ReactNode } from 'react';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
const ProjectEditTab = React.lazy(
  () => import('./admin/components/ProjectEditTab')
);
const SettingsTab = React.lazy(() => import('./admin/components/SettingsTab'));
const TopicInputsTooltipExtraCopy = React.lazy(
  () => import('./admin/components/TopicInputsTooltipExtraCopy')
);
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';

const AdminAllowedTopicsComponent = React.lazy(
  () => import('./admin/containers/ProjectAllowedInputTopics')
);
const AdminTopicsIndexComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/all')
);
const AdminTopicsNewComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/New')
);
const AdminTopicsEditComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/Edit')
);

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
    'admin.projects.project': [
      {
        path: 'allowed-input-topics',
        element: <AdminAllowedTopicsComponent />,
      },
    ],
    'admin.settings': [
      {
        path: 'topics',
        element: <AdminTopicsIndexComponent />,
      },
      {
        path: 'topics/new',
        element: <AdminTopicsNewComponent />,
      },
      {
        path: 'topics/:topicId/edit',
        element: <AdminTopicsEditComponent />,
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
    'app.containers.Admin.projects.edit.general.components.TopicInputs.tooltipExtraCopy':
      () => <TopicInputsTooltipExtraCopy />,
  },
};

export default configuration;
