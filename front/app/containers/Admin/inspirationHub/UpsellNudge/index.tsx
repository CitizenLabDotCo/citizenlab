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

import CardSkeletons from './CardSkeletons.svg';
import messages from './messages';

const UPSELL_BULLET_POINTS = [
  messages.bulletPoint1,
  messages.bulletPoint2,
  messages.bulletPoint3,
];

const UpsellNudge = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box pt="45px" pr="51px" pb="45px" pl="51px">
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
          {UPSELL_BULLET_POINTS.map((message, index) => (
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
        <Box
          display="flex"
          maxWidth="480px"
          w="100%"
          alignItems="flex-start"
          justifyContent="center"
        >
          <img src={CardSkeletons} alt="" width="100%" />
        </Box>
      </Box>
    </Box>
  );
};

export default UpsellNudge;
