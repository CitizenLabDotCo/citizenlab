import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import ViewSurveyButton from '../ViewSurveyButton';

import FormResults from './components/FormResults';
import HealthScoreWidget from './components/HealthScoreWidget';
import QuarterlyDatePicker from './components/QuarterlyDatePicker';
import UpsellNudge from './components/UpsellNudge';

const LiveMonitor = () => {
  const { formatMessage } = useIntl();

  const { data: project, isError, isLoading } = useCommunityMonitorProject({});
  const projectId = project?.data.id;
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  if (isLoading) {
    return null;
  }

  return (
    <Box mt="48px">
      <Box display="flex" justifyContent="space-between">
        <Title color="primary">
          {formatMessage(messages.communityMonitorLabel)}
        </Title>

        <Box display="flex" gap="16px">
          <QuarterlyDatePicker />
          {project && (
            <ViewSurveyButton buttonStyle="admin-dark" py="4px" px="8px" />
          )}
        </Box>
      </Box>

      <Box display="flex">
        <HealthScoreWidget phaseId={phaseId} />
      </Box>
      <FormResults projectId={projectId} phaseId={phaseId} />

      {isError && ( // User has no access to Community Monitor
        <Box mt="24px">
          <UpsellNudge />
        </Box>
      )}
    </Box>
  );
};

export default LiveMonitor;
