import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
const LeafletConfig = React.lazy(
  () => import('./shared/components/Map/LeafletConfig')
);
const Legend = React.lazy(() => import('./shared/components/Map/Legend'));
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { InsertConfigurationOptions, ITab } from 'typings';
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const CustomMapConfigComponent = React.lazy(
  () => import('./admin/containers/ProjectCustomMapConfigPage')
);

type RenderOnHideTabConditionProps = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
  onRemove: (name: string) => void;
  project: IProjectData;
  phases: IPhaseData[] | null;
  selectedPhase?: IPhaseData;
};

const RenderOnHideTabCondition = (props: RenderOnHideTabConditionProps) => {
  const { selectedPhase } = props;
  const showTab =
    selectedPhase?.attributes.participation_method === 'ideation' ||
    selectedPhase?.attributes.participation_method === 'voting';

  if (showTab) {
    return <Tab {...props} />;
  }

  return null;
};

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects.project': [
      {
        path: 'phases/:phaseId/map',
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
    'app.containers.Admin.projects.edit': RenderOnHideTabCondition,
  },
};

export default configuration;
