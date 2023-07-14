import React, { useState } from 'react';
import { isUndefined } from 'lodash-es';
import { Toggle, Box, ListItem } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import { CampaignData } from './types';
import Button from 'components/UI/Button';
import CampaignDescription from './CampaignDescription';
import NewProjectPhaseModal from './NewProjectPhaseModal';

type Props = {
  campaign: CampaignData;
  onClickViewExample?: () => void;
};

const CampaignRow = ({ campaign, onClickViewExample }: Props) => {
  const [isNewPhaseModalOpen, setIsNewPhaseModalOpen] = useState(false);
  const { mutate: updateCampaign } = useUpdateCampaign();
  const toggleEnabled = () => {
    updateCampaign({
      id: campaign.id,
      campaign: {
        enabled: !campaign.attributes.enabled,
      },
    });
  };
  const closeNewPhaseModal = () => {
    setIsNewPhaseModalOpen(false);
  };
  const handleOnEnabledToggle = () => {
    // Not abstracting yet since it is one scenario for now. If we need more, we can abstract it to handle more confirmations
    if (campaign.attributes.campaign_name === 'project_phase_started') {
      setIsNewPhaseModalOpen(true);
    } else {
      toggleEnabled();
    }
  };

  return (
    <>
      <NewProjectPhaseModal
        open={isNewPhaseModalOpen}
        close={closeNewPhaseModal}
        onConfirm={toggleEnabled}
        campaign={campaign}
      />
      <ListItem p="8px 0">
        <Box display="flex" alignItems="center">
          <Toggle
            disabled={isUndefined(campaign.attributes.enabled)}
            checked={
              isUndefined(campaign.attributes.enabled) ||
              campaign.attributes.enabled
            }
            onChange={handleOnEnabledToggle}
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
    </>
  );
};

export default CampaignRow;
