import React from 'react';

import {
  Toggle,
  Box,
  ListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';

import { CampaignContext } from 'api/campaigns/types';
import useAddCampaign from 'api/campaigns/useAddCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import CampaignDescription from './CampaignDescription';
import { CampaignData } from './types';

type Props = {
  campaign: CampaignData;
  context?: CampaignContext;
  onClickViewExample?: () => void;
};

const CampaignRow = ({ campaign, context, onClickViewExample }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { mutate: addCampaign } = useAddCampaign();
  const { mutate: updateCampaign } = useUpdateCampaign();
  const unpersistedContextCampaign =
    context && !campaign.relationships.context?.data?.id;

  const toggleEnabled = () => {
    if (unpersistedContextCampaign) {
      addCampaign({
        context,
        campaign_name: campaign.attributes.campaign_name,
        enabled: !campaign.attributes.enabled,
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

  const isEditingEnabled =
    useFeatureFlag({
      name: 'customised_automated_emails',
    }) &&
    (!context || campaign.attributes.enabled);
  const isEditable = (campaign.attributes.editable_regions || []).length > 0;
  const handleEditClick = () => {
    if (unpersistedContextCampaign) {
      addCampaign(
        {
          context,
          campaign_name: campaign.attributes.campaign_name,
          enabled: campaign.attributes.enabled,
        },
        {
          onSuccess: (addedCampaign) => {
            clHistory.push(
              `${pathname}/${addedCampaign.data.id}/edit` as RouteType
            );
          },
        }
      );
    } else {
      clHistory.push(`${pathname}/${campaign.id}/edit` as RouteType);
    }
  };

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
                  onClick={handleEditClick}
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
