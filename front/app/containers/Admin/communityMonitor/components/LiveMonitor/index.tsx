import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import ViewSurveyButton from '../ViewSurveyButton';

import FormResults from './components/FormResults';
import QuarterlyDatePicker from './components/QuarterlyDatePicker';

const LiveMonitor = () => {
  const { data: project } = useCommunityMonitorProject({});
  const projectId = project?.data.id;
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Box mt="48px">
      <Box display="flex" justifyContent="space-between">
        <Title color="primary">
          <FormattedMessage {...messages.communityMonitorLabel} />
        </Title>
        <Box display="flex" gap="16px">
          <QuarterlyDatePicker />
          <ViewSurveyButton buttonStyle="admin-dark" py="4px" px="8px" />
        </Box>
      </Box>

      <Box mt="28px">
        <FormResults projectId={projectId} phaseId={phaseId} />
      </Box>
    </Box>
  );
};

export default LiveMonitor;
