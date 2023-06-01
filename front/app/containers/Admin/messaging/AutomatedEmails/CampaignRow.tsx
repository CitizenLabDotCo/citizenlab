import React from 'react';
import { isUndefined } from 'lodash-es';
import {
  Toggle,
  Box,
  Text,
  IconTooltip,
  ListItem,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import { CampaignData } from './types';
import Button from 'components/UI/Button';

type Props = {
  campaign: CampaignData;
  onClickViewExample: () => void;
};

const CampaignRow = ({ campaign, onClickViewExample }: Props) => {
  const { formatMessage } = useIntl();
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
        <Box display="flex" flexDirection="column" ml="20px">
          <Text color="grey800" m="0">
            {campaign.campaign_description}
          </Text>
          {campaign.recipient_segment &&
            (campaign.trigger || campaign.schedule) && (
              <Box display="flex">
                <Box display="flex" justifyContent="center">
                  <IconTooltip
                    placement="top"
                    icon="user"
                    m="-2px 4px 0 0"
                    iconColor={colors.coolGrey600}
                    iconSize={`${fontSizes.m}px`}
                    content={formatMessage(messages.automatedEmailsRecipients)}
                  />
                  <Text m="0" color="coolGrey600" fontSize="s">
                    {campaign.recipient_segment}
                  </Text>
                </Box>
                <Box ml="4px">·</Box>
                <Box display="flex" justifyContent="center" ml="4px">
                  <IconTooltip
                    placement="top"
                    icon="clock"
                    m="-2px 4px 0 0"
                    iconColor={colors.coolGrey600}
                    iconSize={`${fontSizes.m}px`}
                    content={formatMessage(messages.automatedEmailsTriggers)}
                  />
                  <Text m="0" color="coolGrey600" fontSize="s">
                    {campaign.trigger || campaign.schedule}
                  </Text>
                </Box>
                {campaign.attributes.campaign_name.includes('digest') && (
                  <IconTooltip
                    placement="right-start"
                    m="-2px 0 0 5px"
                    iconColor={colors.coolGrey600}
                    iconSize={`${fontSizes.s}px`}
                    content={formatMessage(messages.automatedEmailsDigest)}
                  />
                )}
              </Box>
            )}
        </Box>
        <Box display="flex" justifyContent="flex-end" flexGrow={1}>
          <Button
            icon="eye"
            onClick={onClickViewExample}
            buttonStyle="secondary"
          >
            <FormattedMessage {...messages.viewExample} />
          </Button>
        </Box>
      </Box>
    </ListItem>
  );
};

export default CampaignRow;
