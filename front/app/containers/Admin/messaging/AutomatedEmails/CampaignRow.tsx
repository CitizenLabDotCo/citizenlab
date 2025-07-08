import React, { useState } from 'react';

import {
  Toggle,
  Box,
  ListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useAddCampaign from 'api/campaigns/useAddCampaign';
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
  phaseId?: string;
  projectId?: string;
  globalEnabled?: boolean;
  onClickViewExample?: () => void;
};

const CampaignRow = ({
  campaign,
  phaseId,
  projectId,
  globalEnabled,
  onClickViewExample,
}: Props) => {
  const hasContext = !!(phaseId || projectId);
  const { formatMessage } = useIntl();
  const [isNewPhaseModalOpen, setIsNewPhaseModalOpen] = useState(false);
  const { mutate: addCampaign } = useAddCampaign();
  const { mutate: updateCampaign } = useUpdateCampaign();
  const toggleEnabled = () => {
    if (hasContext && !campaign.relationships.context?.data?.id) {
      addCampaign({
        phaseId,
        campaign_name: campaign.attributes.campaign_name,
        enabled: !campaign.attributes.enabled,
        subject_multiloc: campaign.attributes.subject_multiloc,
        body_multiloc: campaign.attributes.body_multiloc,
        sender: campaign.attributes.sender,
      });
    } else {
      updateCampaign({
        id: campaign.id,
        campaign: {
          enabled: !campaign.attributes.enabled,
        },
      });
    }
  };
  const closeNewPhaseModal = () => {
    setIsNewPhaseModalOpen(false);
  };
  const handleOnEnabledToggle = () => {
    // Not abstracting yet since it is one scenario for now. If we need more, we can abstract it to handle more confirmations
    if (
      campaign.attributes.campaign_name === 'project_phase_started' &&
      !campaign.relationships.context
    ) {
      // TODO: Use context property, not relationship
      setIsNewPhaseModalOpen(true);
    } else {
      toggleEnabled();
    }
  };

  const isEditingEnabled = useFeatureFlag({
    name: 'customised_automated_emails',
  });
  const isEditable = (campaign.attributes.editable_regions || []).length > 0;

  const disabledByParent = hasContext && !globalEnabled;

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
            disabled={disabledByParent}
            checked={!!campaign.attributes.enabled}
            onChange={handleOnEnabledToggle}
          />
          <CampaignDescription
            campaign={campaign}
            disabledByParent={disabledByParent}
          />
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
            {isEditingEnabled && !hasContext && (
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
