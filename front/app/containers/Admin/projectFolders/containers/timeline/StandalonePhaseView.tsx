import React, { lazy, Suspense, useState, useEffect } from 'react';

import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import { getTimelineTab } from '../../../projects/project/phaseSetup/utils';
import {
  FeatureFlags,
  getTabs,
  IPhaseTab,
} from '../../../projects/project/tabs';

import { StandalonePhaseHeader } from './StandalonePhaseHeader';

// Import all the phase tab components lazily
const AdminPhasePermissions = lazy(
  () => import('../../../projects/project/permissions/Phase')
);
const AdminPhaseEmails = lazy(
  () => import('../../../projects/project/admin_phase_email_wrapper')
);
const PhaseSetup = lazy(() => import('../../../projects/project/phaseSetup'));
const AdminProjectSurveyResults = lazy(
  () => import('../../../projects/project/surveyResults')
);
const AdminProjectPoll = lazy(() => import('../../../projects/project/poll'));
const AdminProjectIdeas = lazy(() => import('../../../projects/project/ideas'));
const AdminProjectIdeaForm = lazy(
  () => import('../../../projects/project/inputForm')
);
const AdminProjectProposals = lazy(
  () => import('../../../projects/project/proposals')
);
const AdminProjectVolunteering = lazy(
  () => import('../../../projects/project/volunteering')
);
const AdminCustomMapConfigComponent = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);
const AdminProjectsSurvey = lazy(
  () => import('../../../projects/project/nativeSurvey')
);
const AdminPhaseSurveyFormTabPanel = lazy(
  () => import('../../../projects/project/surveyForm/TabPanel')
);
const ReportTab = lazy(
  () => import('../../../projects/project/information/ReportTab')
);

interface DataProps {
  project: IProjectData;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
  onPhaseDelete?: () => void;
}

export const StandalonePhaseView = ({
  project,
  selectedPhase,
  setSelectedPhase: _setSelectedPhase,
  onPhaseDelete,
}: DataProps) => {
  const { formatMessage } = useIntl();
  const featureFlags: FeatureFlags = {
    typeform_enabled: useFeatureFlag({
      name: 'typeform_surveys',
    }),
    surveys_enabled: useFeatureFlag({
      name: 'surveys',
    }),
    report_builder_enabled: useFeatureFlag({
      name: 'report_builder',
    }),
  };

  const tabs: IPhaseTab[] = selectedPhase
    ? getTabs(selectedPhase, featureFlags, formatMessage)
    : [];

  // Track the active tab locally
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!selectedPhase) return 'setup';
    return getTimelineTab(selectedPhase);
  });

  // When the selected phase changes, reset to the default tab
  useEffect(() => {
    if (selectedPhase) {
      setActiveTab(getTimelineTab(selectedPhase));
    }
  }, [selectedPhase]);

  const renderTabContent = () => {
    if (!selectedPhase) return null;

    switch (activeTab) {
      case 'setup':
        return (
          <PhaseSetup projectId={project.id} phase={{ data: selectedPhase }} />
        );
      case 'access-rights':
        return <AdminPhasePermissions phaseId={selectedPhase.id} />;
      case 'emails':
        return (
          <AdminPhaseEmails projectId={project.id} phaseId={selectedPhase.id} />
        );
      case 'survey-results':
        return <AdminProjectSurveyResults phaseId={selectedPhase.id} />;
      case 'polls':
        return (
          <AdminProjectPoll projectId={project.id} phaseId={selectedPhase.id} />
        );
      case 'ideas':
        return (
          <AdminProjectIdeas
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'form':
        return (
          <AdminProjectIdeaForm
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'proposals':
        return (
          <AdminProjectProposals
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'volunteering':
        return (
          <AdminProjectVolunteering
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'map':
        return (
          <AdminCustomMapConfigComponent
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'results':
        return (
          <AdminProjectsSurvey
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'survey-form':
        return (
          <AdminPhaseSurveyFormTabPanel
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'report':
        return <ReportTab projectId={project.id} phaseId={selectedPhase.id} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box p="8px 24px 24px 24px">
        {selectedPhase && (
          <StandalonePhaseHeader
            phase={selectedPhase}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            projectId={project.id}
            onPhaseDelete={onPhaseDelete}
          />
        )}

        <Box p={`${defaultAdminCardPadding}px`} background={colors.white}>
          {selectedPhase && (
            <Suspense
              fallback={
                <Centerer>
                  <Spinner />
                </Centerer>
              }
            >
              {renderTabContent()}
            </Suspense>
          )}
        </Box>
      </Box>
    </>
  );
};
