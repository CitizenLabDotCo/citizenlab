import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import LeafletConfig from './shared/components/Map/LeafletConfig';
import Legend from './shared/components/Map/Legend';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';
import FeatureFlag from 'components/FeatureFlag';

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
        path: '/:locale/admin/projects/:projectId/map',
        name: 'map',
        container: () =>
          import('./admin/containers/ProjectCustomMapConfigPage'),
      },
    ],
  },
  outlets: {
    'app.components.Map.leafletConfig': (props) => (
      <FeatureFlag name="custom_maps">
        <LeafletConfig {...props} />
      </FeatureFlag>
    ),
    'app.components.Map.Legend': (props) => (
      <FeatureFlag name="custom_maps">
        <Legend {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.projects.edit': (props) => {
      return (
        <RenderOnHideTabCondition project={props.project} phases={props.phases}>
          <Tab {...props} />
        </RenderOnHideTabCondition>
      );
    },
  },
};

export default configuration;
