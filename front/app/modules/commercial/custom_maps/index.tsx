import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
const LeafletConfig = React.lazy(
  () => import('./shared/components/Map/LeafletConfig')
);
const Legend = React.lazy(() => import('./shared/components/Map/Legend'));
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

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
      participationMethod !== 'voting') ||
    (processType === 'timeline' &&
      !isNilOrError(phases) &&
      phases.filter((phase) => {
        return (
          phase.attributes.participation_method === 'ideation' ||
          phase.attributes.participation_method === 'voting'
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
