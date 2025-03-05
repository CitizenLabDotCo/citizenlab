import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import FormResults from 'components/admin/FormResults';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import QuarterlyDatePicker from './components/QuarterlyDatePicker';

const LiveMonitor = () => {
  const { data: project } = useCommunityMonitorProject();
  const projectId = project?.data.id;
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Box mt="48px">
      <Box display="flex" justifyContent="space-between">
        <Title color="primary">
          <FormattedMessage {...messages.communityMonitorLabel} />
        </Title>
        <QuarterlyDatePicker />
      </Box>

      <Box background={colors.white} py="30px" px="40px">
        <FormResults projectId={projectId} phaseId={phaseId} />
      </Box>
    </Box>
  );
};

export default LiveMonitor;
