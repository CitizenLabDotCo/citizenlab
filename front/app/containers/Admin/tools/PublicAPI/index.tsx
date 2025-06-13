import React from 'react';

import { Box, Text, colors, Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import apiImage from './api.png';

export const PublicAPI = () => {
  const isPublicAPIEnabled = useFeatureFlag({ name: 'public_api_tokens' });
  const { formatMessage } = useIntl();

  return (
    <Box background={colors.white} display="flex" p="20px">
      <img
        width="320px"
        height="240px"
        src={apiImage}
        alt={formatMessage(messages.publicAPIImage)}
        style={{ borderRadius: '3px' }}
      />

      <Box ml="32px" display="flex" flexDirection="column">
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.publicAPITitle)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.publicAPIDescription)}
        </Text>
        <Tooltip
          content={<FormattedMessage {...messages.publicAPIDisabled} />}
          disabled={isPublicAPIEnabled}
          placement="top"
          theme="dark"
        >
          <Box>
            <ButtonWithLink
              disabled={!isPublicAPIEnabled}
              height="45px"
              icon={isPublicAPIEnabled ? 'arrow-right' : 'lock'}
              iconColor={colors.white}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/public-api-tokens"
              textColor="white"
              bgColor={colors.primary}
            >
              {formatMessage(messages.managePublicAPIKeys)}
            </ButtonWithLink>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PublicAPI;
