import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const UpsellNudge = () => {
  const { formatMessage } = useIntl();

  const isCommunityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });

  if (!isCommunityMonitorEnabled) {
    // Show upsell
    return (
      <Box
        w="100%"
        h="100%"
        position="absolute"
        top="0"
        left="0"
        right="0"
        display="flex"
        justifyContent="center"
        alignItems="center"
        background={rgba('white', 0.6)}
        zIndex="1"
      >
        <Box
          maxWidth="600px"
          background="white"
          p="16px"
          borderRadius="8px"
          boxShadow="0 0 4px rgba(0, 0, 0, 0.2)"
          display="flex"
        >
          <Icon
            width="80px"
            fill={colors.primary}
            name="lock"
            my="auto"
            mr="12px"
          />

          <Text color="textSecondary">
            {formatMessage(messages.communityMonitorUpsell)}
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};

export default UpsellNudge;
