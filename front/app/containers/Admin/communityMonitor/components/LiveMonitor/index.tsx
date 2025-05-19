import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import EarlyAccessBadge from 'components/admin/EarlyAccessBadge';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import ViewSurveyButton from '../ViewSurveyButton';

import CommunityMonitorUpsell from './components/CommunityMonitorUpsell';
import FormResults from './components/FormResults';
import HealthScoreWidget from './components/HealthScoreWidget';
import QuarterlyDatePicker from './components/QuarterlyDatePicker';

const LiveMonitor = () => {
  const { formatMessage } = useIntl();
  const { data: project, isError, isLoading } = useCommunityMonitorProject({});
  const projectId = project?.data.id;
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <CommunityMonitorUpsell />;
  }

  return (
    <Box mt="48px">
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="16px">
          <Title color="primary">
            {formatMessage(messages.communityMonitorLabel)}
          </Title>
          <Box mt="8px">
            <EarlyAccessBadge />
          </Box>
        </Box>

        <Box display="flex" gap="16px">
          <QuarterlyDatePicker />
          <ViewSurveyButton buttonStyle="admin-dark" py="4px" px="8px" />
        </Box>
      </Box>

      <Box display="flex">
        <HealthScoreWidget phaseId={phaseId} />
      </Box>
      <FormResults projectId={projectId} phaseId={phaseId} />
    </Box>
  );
};

export default LiveMonitor;
