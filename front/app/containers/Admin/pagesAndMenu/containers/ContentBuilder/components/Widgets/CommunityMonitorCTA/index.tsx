import React from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import clHistory from 'utils/cl-router/history';

import messages from './messages';
import Settings from './Settings';

const CommunityMonitorCTA = () => {
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  const goToCommunityMonitorSurvey = () => {
    if (phaseId) {
      clHistory.push(
        `/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phaseId}`
      );
    }
  };

  // TEMPORARY: While waiting for final designs.
  return (
    <Box my="20px">
      <Title textAlign="center" variant="h3">
        How do you feel about living in your city?
      </Title>
      <Box display="flex" justifyContent="center">
        <Button onClick={goToCommunityMonitorSurvey}>
          Take the community survey!
        </Button>
      </Box>
    </Box>
  );
};

CommunityMonitorCTA.craft = {
  related: {
    settings: Settings,
  },
};

export const CommunityMonitorCTATitle = messages.communityMonitorCTATitle;

export default CommunityMonitorCTA;
