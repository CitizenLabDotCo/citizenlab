import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';
import Button from 'components/UI/Button';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import NativeSurveyLayout from './components/NativeSurveyLayout/NativeSurveyLayout';
import NativeSurveyProjectInfo from './components/NativeSurveyProjectInfo/NativeSurveyProjectInfo';

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

  // Hide tab when participation method is not native survey in timeline and continuous process types
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
    citizen: [
      {
        path: '/:locale/projects/:slug/:survey-title/survey',
        element: <NativeSurveyLayout />,
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
    'app.containers.projectsShowPage.projectInfoSideBar': (props) => {
      if (
        props.project.attributes.participation_method === 'native_survey' ||
        props.currentPhase?.attributes.participation_method === 'native_survey'
      ) {
        return (
          <NativeSurveyProjectInfo
            slug={props.project.attributes.slug}
            authUser={props.authUser}
          />
        );
      } else {
        return <></>;
      }
    },
    'app.containers.projectsShowPage.projectActionButtons': (props) => {
      if (
        props.project.attributes.participation_method === 'native_survey' ||
        props.currentPhase?.attributes.participation_method === 'native_survey'
      ) {
        return (
          <>
            <Button
              buttonStyle="primary"
              onClick={
                () =>
                  clHistory.push(
                    `/projects/${props.project.attributes.slug}/survey-title/survey`
                  ) // Replace "survey-title" with the survey title for the project
              }
            >
              <FormattedMessage {...messages.takeTheSurvey} />
            </Button>
          </>
        );
      } else {
        return <></>;
      }
    },
  },
};

export default configuration;
