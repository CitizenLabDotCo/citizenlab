import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { InsertConfigurationOptions, ITab } from 'typings';

const CustomMapConfigComponent = React.lazy(
  () => import('../../../containers/Admin/ProjectCustomMapConfigPage')
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
    'app.containers.Admin.projects.edit': RenderOnHideTabCondition,
  },
};

export default configuration;
