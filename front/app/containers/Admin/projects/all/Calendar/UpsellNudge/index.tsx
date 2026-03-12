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

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import Calendar from './calendar.png';
import messages from './messages';
import PremiumIcon from './PremiumIcon';

const UpsellNudge = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box
      background={colors.white}
      borderRadius={stylingConsts.borderRadius}
      display="flex"
      gap="32px"
      maxWidth="860px"
      position="relative"
    >
      <Box maxWidth="430">
        <Title variant="h2">{formatMessage(messages.upsellTitle)}</Title>
        <Text>{formatMessage(messages.upsellDescription)}</Text>
        <Box mt="28px" display="flex" gap="12px">
          <Tooltip content={formatMessage(messages.featureNotIncluded)}>
            <Button disabled={true} icon="lock">
              {formatMessage(messages.enableCalendarView)}
            </Button>
          </Tooltip>

          <ButtonWithLink
            linkTo={formatMessage(messages.timelineSupportArticle2)}
            buttonStyle="text"
            textColor={theme.colors.tenantPrimary}
          >
            {formatMessage(messages.learnMore)}
          </ButtonWithLink>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        maxWidth="430px"
        w="100%"
        alignItems="center"
        justifyContent="flex-start"
        mt="40px"
      >
        <img src={Calendar} alt="" width="100%" />
      </Box>
      <Box position="absolute" top="20px" right="0">
        <PremiumIcon />
      </Box>
    </Box>
  );
};

export default UpsellNudge;
