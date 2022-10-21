import FeatureFlag from 'components/FeatureFlag';
import React, { ReactNode } from 'react';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import LeafletConfig from './shared/components/Map/LeafletConfig';
import Legend from './shared/components/Map/Legend';

const CustomMapConfigComponent = React.lazy(
  () => import('./admin/containers/ProjectCustomMapConfigPage')
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
        path: 'map',
        element: <CustomMapConfigComponent />,
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
