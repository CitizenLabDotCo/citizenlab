import React from 'react';

import { Toggle, Box, ListItem } from '@citizenlab/cl2-component-library';

import CampaignDescription from 'containers/Admin/messaging/AutomatedEmails/CampaignDescription';
import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

type Props = {
  campaign: CampaignData;
  checked: boolean;
  handleOnEnabledToggle: (campaign: CampaignData) => void;
};

const CampaignRow = ({ campaign, checked, handleOnEnabledToggle }: Props) => {
  const isCampaignDisabled = !campaign.attributes.enabled;
  return (
    <ListItem p="8px 0">
      {isCampaignDisabled && (
        <Warning>
          <FormattedMessage
            {...messages.disabledProjectPhaseEmailMessage}
            values={{
              automatedEmailsLink: (
                <Link to="/admin/messaging/emails/automated">
                  <FormattedMessage {...messages.automatedEmailsLinkText} />
                </Link>
              ),
            }}
          />
        </Warning>
      )}
      <Box display="flex" alignItems="center" mt="8px">
        <Toggle
          disabled={isCampaignDisabled}
          checked={checked}
          onChange={() => {
            handleOnEnabledToggle(campaign);
          }}
        />
        <CampaignDescription campaign={campaign} />
      </Box>
    </ListItem>
  );
};

export default CampaignRow;
