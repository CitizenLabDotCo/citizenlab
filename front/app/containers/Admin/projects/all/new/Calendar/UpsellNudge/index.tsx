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

import Calendar from './calendar.png';
import messages from './messages';

const UpsellNudge = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box
        background={colors.white}
        borderRadius={stylingConsts.borderRadius}
        display="flex"
        gap="32px"
        maxWidth="960px"
      >
        <Box maxWidth="480px">
          <Title variant="h2">{formatMessage(messages.upsellTitle)}</Title>
          <Text>{formatMessage(messages.upsellDescription)}</Text>
          <Box mt="28px" display="flex" gap="12px">
            <Tooltip
              disabled={false}
              content={formatMessage(messages.featureNotIncluded)}
            >
              <Button disabled={true} icon="lock">
                {formatMessage(messages.enableCalendarView)}
              </Button>
            </Tooltip>

            <Button buttonStyle="text" textColor={theme.colors.tenantPrimary}>
              {formatMessage(messages.learnMore)}
            </Button>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          maxWidth="480px"
          w="100%"
          alignItems="center"
          justifyContent="center"
        >
          <img src={Calendar} alt="" width="100%" />
        </Box>
      </Box>
    </Box>
  );
};

export default UpsellNudge;
