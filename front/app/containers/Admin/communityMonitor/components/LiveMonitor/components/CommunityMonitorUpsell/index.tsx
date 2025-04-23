import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  stylingConsts,
  Button,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import HealthScorePreview from './HealthScorePreview';
import messages from './messages';
import tracks from './tracks';

const CommunityMonitorUpsell = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  // Track the upsell being seen
  trackEventByName(tracks.communityMonitorUpsellSeen);

  const upsellBulletPoints = [
    messages.upsellDescription3,
    messages.upsellDescription4,
    messages.upsellDescription5,
    messages.upsellDescription6,
    messages.upsellDescription7,
  ];

  return (
    <Box
      p="32px"
      background={colors.white}
      borderRadius={stylingConsts.borderRadius}
      display="flex"
      gap="32px"
      maxWidth="960px"
    >
      <Box maxWidth="480px">
        <Title>{formatMessage(messages.upsellTitle)}</Title>
        <Text>{formatMessage(messages.upsellDescription1)}</Text>
        <Text>{formatMessage(messages.upsellDescription2)}</Text>
        {upsellBulletPoints.map((message, index) => (
          <Box display="flex" key={index} alignItems="center">
            <Box mr="4px">✅</Box>
            <Text m="0px">{formatMessage(message)}</Text>
          </Box>
        ))}
        <Box mt="28px" display="flex" gap="12px">
          <Tooltip
            disabled={false}
            content={formatMessage(messages.featureNotIncluded)}
          >
            <Button disabled={true} icon="lock">
              {formatMessage(messages.enableCommunityMonitor)}
            </Button>
          </Tooltip>

          <Button
            buttonStyle="text"
            textColor={theme.colors.tenantPrimary}
            onClick={() => {
              trackEventByName(tracks.communityMonitorUpsellLearnMoreClicked);
              window.open(
                'https://support.govocal.com/en/articles/10981781-community-monitoring-resident-satisfaction-survey',
                '_blank'
              );
            }}
          >
            {formatMessage(messages.learnMore)}
          </Button>
        </Box>
      </Box>
      <Box>
        <HealthScorePreview />
      </Box>
    </Box>
  );
};

export default CommunityMonitorUpsell;
