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

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const UpsellNudge = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const upsellBulletPoints = [
    messages.bulletPoint1,
    messages.bulletPoint2,
    messages.bulletPoint3,
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
        <Text>{formatMessage(messages.upsellDescription)}</Text>
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
              {formatMessage(messages.enableInspirationHub)}
            </Button>
          </Tooltip>

          <Button buttonStyle="text" textColor={theme.colors.tenantPrimary}>
            {formatMessage(messages.learnMore)}
          </Button>
        </Box>
      </Box>
      <Box>TODO</Box>
    </Box>
  );
};

export default UpsellNudge;
