import React from 'react';

import { Box, IconTooltip, Tooltip } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../../messages';

interface Props {
  onClick: () => void;
  isSendingPreview: boolean;
  insufficientBalance: boolean;
}

const SendPreviewButton = ({
  onClick,
  isSendingPreview,
  insufficientBalance,
}: Props) => {
  const { data: authUser } = useAuthUser();

  const missingPhoneNumber = !authUser?.data.attributes.phone;

  return (
    <Tooltip
      disabled={!missingPhoneNumber}
      placement="top"
      content={
        <FormattedMessage
          {...messages.sendSmsPreviewNoPhoneTooltip}
          values={{
            profileLink: (
              <Link to="/profile/change-phone">
                <FormattedMessage
                  {...messages.sendSmsPreviewNoPhoneTooltipLink}
                />
              </Link>
            ),
          }}
        />
      }
    >
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        dataCy="e2e-send-sms-preview-button"
        icon="send"
        onClick={onClick}
        processing={isSendingPreview}
        disabled={isSendingPreview || insufficientBalance || missingPhoneNumber}
      >
        <Box display="inline-flex" alignItems="center">
          <FormattedMessage {...messages.sendSmsPreviewButton} />
          <IconTooltip
            ml="4px"
            content={<FormattedMessage {...messages.sendSmsPreviewTooltip} />}
          />
        </Box>
      </ButtonWithLink>
    </Tooltip>
  );
};

export default SendPreviewButton;
