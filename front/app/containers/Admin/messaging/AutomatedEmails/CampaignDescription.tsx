import React from 'react';
import { CampaignData } from './types';
import {
  Box,
  Text,
  IconTooltip,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  campaign: CampaignData;
}

const CampaignDescription = ({ campaign }: Props) => {
  const { formatMessage } = useIntl();
  return (
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
  );
};

export default CampaignDescription;
