import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import apiImage from './api.png';

export const PublicAPI = () => {
  const isPublicAPIEnabled = false;
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
        <Tippy
          plugins={[
            {
              name: 'hideOnEsc',
              defaultValue: true,
              fn({ hide }) {
                function onKeyDown(event) {
                  if (event.keyCode === 27) {
                    hide();
                  }
                }

                return {
                  onShow() {
                    document.addEventListener('keydown', onKeyDown);
                  },
                  onHide() {
                    document.removeEventListener('keydown', onKeyDown);
                  },
                };
              },
            },
          ]}
          content={<FormattedMessage {...messages.publicAPIDisabled} />}
          disabled={isPublicAPIEnabled}
          placement="top"
          theme="dark"
          interactive={false}
          role="tooltip"
        >
          <Box tabIndex={0} width="fit-content">
            <Button
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
            </Button>
          </Box>
        </Tippy>
      </Box>
    </Box>
  );
};

export default PublicAPI;
