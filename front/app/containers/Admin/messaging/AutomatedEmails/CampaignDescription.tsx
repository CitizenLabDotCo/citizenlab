import React from 'react';

import {
  Box,
  Text,
  IconTooltip,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

import { CampaignData } from './types';

interface Props {
  campaign: CampaignData;
  disabledByParent: boolean;
}

const CampaignDescription = ({ campaign, disabledByParent = false }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" flexDirection="column" ml="20px">
      <Box display="flex">
        <Text color="grey800" m="0">
          {campaign.campaign_description}
        </Text>
        {disabledByParent && (
          <IconTooltip
            placement="top-start"
            content={
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
            }
          />
        )}
      </Box>
      {campaign.recipient_segment &&
        (campaign.trigger || campaign.schedule) && (
          <Box display="flex" alignItems="center">
            <Box display="flex" justifyContent="center" alignItems="center">
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
            <Box
              display="flex"
              justifyContent="center"
              ml="4px"
              alignItems="center"
            >
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
