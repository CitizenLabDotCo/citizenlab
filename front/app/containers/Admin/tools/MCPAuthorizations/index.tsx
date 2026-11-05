import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import mcpImage from './mcp.svg';

export const MCPAuthorizations = () => {
  const { formatMessage } = useIntl();

  return (
    <Box background={colors.white} display="flex" p="20px" mb="20px">
      <img
        width="320px"
        height="240px"
        src={mcpImage}
        alt={formatMessage(messages.mcpAuthorizationsImage)}
        style={{ borderRadius: '3px' }}
      />

      <Box ml="32px" display="flex" flexDirection="column">
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.mcpAuthorizationsTitle)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.mcpAuthorizationsDescription)}
        </Text>
        <Box>
          <ButtonWithLink
            height="45px"
            icon="arrow-right"
            iconColor={colors.white}
            iconPos="right"
            width="fit-content"
            to="/admin/tools/mcp"
            textColor="white"
            bgColor={colors.primary}
          >
            {formatMessage(messages.manageMcpAuthorizations)}
          </ButtonWithLink>
        </Box>
      </Box>
    </Box>
  );
};

export default MCPAuthorizations;
