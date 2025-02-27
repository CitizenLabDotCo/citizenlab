import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import AnonymousToggle from './components/AnonymousToggle';
import SurveySettings from './components/SurveySettings';

const Settings = () => {
  const { data: project } = useCommunityMonitorProject();
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Box mt="40px" py="30px" px="40px" background={colors.white}>
      <SurveySettings />
      {phaseId && (
        <>
          <AnonymousToggle phaseId={phaseId} />
          <ActionForms phaseId={phaseId} />
        </>
      )}
    </Box>
  );
};

export default Settings;
