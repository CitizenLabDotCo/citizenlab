import React from 'react';

import {
  Badge,
  Box,
  colors,
  Icon,
  Title,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import ViewSurveyButton from '../ViewSurveyButton';

import CommunityMonitorUpsell from './components/CommunityMonitorUpsell';
import FormResults from './components/FormResults';
import HealthScoreWidget from './components/HealthScoreWidget';
import QuarterlyDatePicker from './components/QuarterlyDatePicker';

const LiveMonitor = () => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  // Determine if the community monitor feature is allowed
  const communityMonitorSetting =
    appConfiguration?.data.attributes.settings.community_monitor;
  const isCommunityMonitorAllowed =
    communityMonitorSetting && communityMonitorSetting.allowed;

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
        <Box display="flex" alignItems="center" gap="12px">
          <Title color="primary">
            {formatMessage(messages.communityMonitorLabel)}
          </Title>
          {!isCommunityMonitorAllowed && ( // If the feature is enabled, but not allowed, it's in Beta
            <Box display="flex" mt="4px">
              <Tooltip content={formatMessage(messages.betaTooltipExplanation)}>
                <Badge color={colors.primary}>
                  <Box display="flex" alignItems="center">
                    {formatMessage(messages.betaLabel)}
                    <Icon
                      ml="4px"
                      width="16px"
                      name="info-outline"
                      fill={colors.primary}
                    />
                  </Box>
                </Badge>
              </Tooltip>
            </Box>
          )}
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
