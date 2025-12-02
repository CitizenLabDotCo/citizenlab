import React from 'react';

import { Box, Text, colors, Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import webhooksImage from './webhooks.png';

export const Webhooks = () => {
  const isWebhooksActive = useFeatureFlag({ name: 'public_api_tokens' });
  const { formatMessage } = useIntl();

  return (
    <Box background={colors.white} display="flex" p="20px" mb="20px">
      <img
        width="320px"
        height="240px"
        src={webhooksImage}
        alt={formatMessage(messages.webhooksImage)}
        style={{ borderRadius: '3px' }}
      />

      <Box ml="32px" display="flex" flexDirection="column">
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.webhooksTitle)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.webhooksDescription)}
        </Text>
        <Tooltip
          content={<FormattedMessage {...messages.webhooksDisabled} />}
          disabled={isWebhooksActive}
          placement="top"
          theme="dark"
        >
          <Box>
            <ButtonWithLink
              disabled={!isWebhooksActive}
              height="45px"
              icon={isWebhooksActive ? 'arrow-right' : 'lock'}
              iconColor={colors.white}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/webhooks"
              textColor="white"
              bgColor={colors.primary}
            >
              {formatMessage(messages.manageWebhooks)}
            </ButtonWithLink>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Webhooks;
