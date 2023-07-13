import React from 'react';
import { Toggle, Box, ListItem } from '@citizenlab/cl2-component-library';
import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import CampaignDescription from 'containers/Admin/messaging/AutomatedEmails/CampaignDescription';

type Props = {
  campaign: CampaignData;
  checked: boolean;
  handleOnEnabledToggle: (campaign: CampaignData) => () => void;
};

const CampaignRow = ({ campaign, checked, handleOnEnabledToggle }: Props) => {
  return (
    <ListItem p="8px 0">
      <Box display="flex" alignItems="center">
        <Toggle
          disabled={!campaign.attributes.enabled}
          checked={checked}
          onChange={handleOnEnabledToggle(campaign)}
        />
        <CampaignDescription campaign={campaign} />
      </Box>
    </ListItem>
  );
};

export default CampaignRow;
