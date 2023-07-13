import React from 'react';
import { isUndefined } from 'lodash-es';
import { Toggle, Box, ListItem } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import { CampaignData } from './types';
import Button from 'components/UI/Button';
import CampaignDescription from './CampaignDescription';

type Props = {
  campaign: CampaignData;
  onClickViewExample?: () => void;
};

const CampaignRow = ({ campaign, onClickViewExample }: Props) => {
  const { mutate: updateCampaign } = useUpdateCampaign();
  const handleOnEnabledToggle = (campaign: CampaignData) => () => {
    updateCampaign({
      id: campaign.id,
      campaign: {
        enabled: !campaign.attributes.enabled,
      },
    });
  };

  return (
    <ListItem p="8px 0">
      <Box display="flex" alignItems="center">
        <Toggle
          disabled={isUndefined(campaign.attributes.enabled)}
          checked={
            isUndefined(campaign.attributes.enabled) ||
            campaign.attributes.enabled
          }
          onChange={handleOnEnabledToggle(campaign)}
        />
        <CampaignDescription campaign={campaign} />
        {onClickViewExample && (
          <Box display="flex" justifyContent="flex-end" flexGrow={1}>
            <Button
              icon="eye"
              onClick={onClickViewExample}
              buttonStyle="secondary"
            >
              <FormattedMessage {...messages.viewExample} />
            </Button>
          </Box>
        )}
      </Box>
    </ListItem>
  );
};

export default CampaignRow;
