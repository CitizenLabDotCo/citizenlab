import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import FormResults from 'containers/Admin/projects/project/nativeSurvey/FormResults';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const LiveMonitor = () => {
  const { data: project } = useCommunityMonitorProject();
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  console.log({ projectId: project?.data.id, phaseId });

  return (
    <Box mt="48px">
      <Title color="primary">
        <FormattedMessage {...messages.communityMonitorLabel} />
      </Title>
      <FormResults
        projectIdFromProps={project?.data.id}
        phaseIdFromProps={phaseId}
      />
    </Box>
  );
};

export default LiveMonitor;
