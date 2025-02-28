import React, { useState } from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import { useIntl } from 'utils/cl-intl';

import AnonymousToggle from './components/AnonymousToggle';
import CommunityMonitorManagement from './components/CommunityMonitorManagement';
import SettingsTabSelector from './components/SettingsTabSelector';
import SurveySettings from './components/SurveySettings';
import messages from './messages';
import { SettingsTab } from './utils';

const Settings = () => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject();
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  // Define the tabs for the settings page
  const settingsTabs: { key: SettingsTab; label: string }[] = [
    { key: 'survey_settings', label: formatMessage(messages.surveySettings) },
    { key: 'access_rights', label: formatMessage(messages.accessRights) },
    { key: 'moderator_management', label: formatMessage(messages.moderators) },
  ];

  // By default, show the Survey Settings tab
  const [currentTab, setCurrentTab] = useState<SettingsTab>(
    settingsTabs[0].key
  );

  if (!project || !phaseId) return null;

  return (
    <Box mt="40px" py="30px" px="40px" background={colors.white}>
      <Title color="primary" variant="h1">
        {formatMessage(messages.settings)}
      </Title>
      <SettingsTabSelector
        currentTab={currentTab}
        settingsTabs={settingsTabs}
        setCurrentTab={setCurrentTab}
      />
      {currentTab === 'survey_settings' && (
        <>
          <SurveySettings />
          <AnonymousToggle phaseId={phaseId} />
        </>
      )}
      {currentTab === 'access_rights' && <ActionForms phaseId={phaseId} />}
      {currentTab === 'moderator_management' && (
        <CommunityMonitorManagement projectId={project.data.id} />
      )}
    </Box>
  );
};

export default Settings;
