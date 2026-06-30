import React from 'react';

import {
  Box,
  StatusLabel,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { ICampaignData } from 'api/campaigns/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  campaign: ICampaignData;
  draft: boolean;
  onSend: () => void;
  isSending: boolean;
}

const Header = ({ campaign, draft, onSend, isSending }: Props) => {
  const localize = useLocalize();

  return (
    <Box display="flex" alignItems="center" mt="20px" mb="20px">
      <Box display="flex" alignItems="center" mr="auto" gap="12px">
        <Title m="0px">{localize(campaign.attributes.subject_multiloc)}</Title>
        {draft ? (
          <StatusLabel
            backgroundColor={colors.brown}
            text={<FormattedMessage {...messages.draft} />}
          />
        ) : (
          <StatusLabel
            backgroundColor={colors.success}
            text={<FormattedMessage {...messages.sent} />}
          />
        )}
      </Box>
      {draft && (
        <Box display="flex" gap="10px" alignItems="center">
          <ButtonWithLink
            to="/admin/messaging/sms/$campaignId/edit"
            params={{ campaignId: campaign.id }}
            buttonStyle="secondary-outlined"
            icon="edit"
          >
            <FormattedMessage {...messages.editButtonLabel} />
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="admin-dark"
            icon="send"
            iconPos="right"
            onClick={onSend}
            processing={isSending}
            disabled={isSending}
          >
            <FormattedMessage {...messages.sendNowButton} />
          </ButtonWithLink>
        </Box>
      )}
    </Box>
  );
};

export default Header;
