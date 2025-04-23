import React from 'react';

import {
  Box,
  colors,
  Icon,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import UpsellAIPreviewPng from '../assets/Upsell_AI_Preview.png';
import UpsellPlaceholderText from '../assets/Upsell_Placeholder_Text.svg';
import messages from '../messages';

const Summary = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Box
        w="148px"
        bg={colors.white}
        p="12px"
        borderRadius="4px"
        border={`2px solid ${theme.colors.tenantPrimaryLighten75}`}
        position="absolute"
      >
        <Box display="flex" alignItems="center">
          <Box
            borderRadius="45%"
            bg={theme.colors.tenantPrimaryLighten75}
            mr="4px"
            h="16px"
            w="16px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              height="10px"
              width="10px"
              name="stars"
              fill={theme.colors.tenantPrimary}
            />
          </Box>
          <Text fontSize="xs" color="grey700" m="0px">
            {formatMessage(messages.aiSummary)}
          </Text>
        </Box>

        <Image mt="8px" w="120px" src={UpsellPlaceholderText} alt="" />
      </Box>
      <Image w="300px" src={UpsellAIPreviewPng} alt="" />
    </Box>
  );
};

export default Summary;
