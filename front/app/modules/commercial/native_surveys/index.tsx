import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';

const AdminProjectIdeaEditFormComponent = React.lazy(
  () => import('./admin/containers/projects/surveys')
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
  const noNativeSurveyInTimeline =
    !isNilOrError(phases) &&
    !phases.some(
      (phase) => phase.attributes.participation_method === 'native_survey'
    );
  const hideTab =
    (processType === 'continuous' && participationMethod !== 'native_survey') ||
    (processType === 'timeline' &&
      !isNilOrError(phases) &&
      noNativeSurveyInTimeline);

  if (hideTab) {
    return null;
  }

  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects.project': [
      {
        path: 'native-survey',
        element: <AdminProjectIdeaEditFormComponent />,
      },
    ],
  },
  outlets: {
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
