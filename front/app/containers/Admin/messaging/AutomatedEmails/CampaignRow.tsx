import React, { useState } from 'react';

import {
  Toggle,
  Box,
  ListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { isUndefined } from 'lodash-es';

import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import CampaignDescription from './CampaignDescription';
import PhaseEmailSettingsModal from './PhaseEmailSettingsModal';
import { CampaignData } from './types';

type Props = {
  campaign: CampaignData;
  onClickViewExample?: () => void;
};

const CampaignRow = ({ campaign, onClickViewExample }: Props) => {
  const { formatMessage } = useIntl();
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

  const isEditingEnabled = useFeatureFlag({
    name: 'customised_automated_emails',
  });
  const isEditable = (campaign.attributes.editable_regions || []).length > 0;

  return (
    <>
      <PhaseEmailSettingsModal
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
          <Box display="flex" justifyContent="flex-end" flexGrow={1}>
            {onClickViewExample && (
              <Box>
                <ButtonWithLink
                  icon="eye"
                  onClick={onClickViewExample}
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.viewExample} />
                </ButtonWithLink>
              </Box>
            )}
            {isEditingEnabled && (
              <Box ml="12px">
                <Tooltip
                  disabled={isEditable}
                  content={formatMessage(messages.editDisabledTooltip)}
                >
                  <ButtonWithLink
                    icon="edit"
                    linkTo={`/admin/messaging/emails/automated/${campaign.id}/edit`}
                    disabled={!isEditable}
                    buttonStyle="secondary-outlined"
                  >
                    <FormattedMessage {...messages.editButtonLabel} />
                  </ButtonWithLink>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </ListItem>
    </>
  );
};

export default CampaignRow;
