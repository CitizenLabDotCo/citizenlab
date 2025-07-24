import React from 'react';

import {
  Toggle,
  Box,
  ListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { CampaignContext } from 'api/campaigns/types';
import useAddCampaign from 'api/campaigns/useAddCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import CampaignDescription from './CampaignDescription';
import { CampaignData } from './types';

type Props = CampaignContext & {
  campaign: CampaignData;
  onClickViewExample?: () => void;
};

const CampaignRow = ({
  campaign,
  phaseId,
  projectId,
  onClickViewExample,
}: Props) => {
  const hasContext = !!(phaseId || projectId);
  const { formatMessage } = useIntl();
  const { mutate: addCampaign } = useAddCampaign();
  const { mutate: updateCampaign } = useUpdateCampaign();
  const toggleEnabled = () => {
    const unpersistedContextCampaign =
      hasContext && !campaign.relationships.context?.data?.id;
    if (unpersistedContextCampaign) {
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

  const isEditingEnabled = useFeatureFlag({
    name: 'customised_automated_emails',
  });
  const isEditable = (campaign.attributes.editable_regions || []).length > 0;

  return (
    <ListItem p="8px 0">
      <Box display="flex" alignItems="center">
        <Toggle
          checked={!!campaign.attributes.enabled}
          onChange={toggleEnabled}
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
  );
};

export default CampaignRow;
