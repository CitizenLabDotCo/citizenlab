import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import useCampaigns from 'api/campaigns/useCampaigns';
import useSupportedCampaignNames from 'api/campaigns/useSupportedCampaignNames';

import useLocalize from 'hooks/useLocalize';

import CampaignRow from 'containers/Admin/messaging/AutomatedEmails/CampaignRow';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const AdminPhaseEmailWrapper = () => {
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false });
  const { data: supportedCampaigns } = useSupportedCampaignNames({ phaseId });
  const supportedCampaignNames = supportedCampaigns?.data.attributes || [];
  const contextCampaigns = useCampaigns({
    ...(phaseId ? { context: { phaseId } } : {}),
    pageSize: 250,
  }).data?.pages.flatMap((page) => page.data);
  const { data: supportedCampaignsPages } = useCampaigns({ pageSize: 250 });
  const globalCampaigns = supportedCampaignsPages?.pages.flatMap(
    (page) => page.data
  );

  return (
    <Box>
      <Text color="coolGrey600" mt="0px" fontSize="m">
        <FormattedMessage {...messages.automatedEmailsDescription} />
      </Text>
      {supportedCampaignNames.length > 0 &&
        supportedCampaignNames.map((campaignType) => {
          let campaign = contextCampaigns?.find(
            (campaign) => campaign.attributes.campaign_name === campaignType
          );
          if (!campaign) {
            campaign = globalCampaigns?.find(
              (campaign) => campaign.attributes.campaign_name === campaignType
            );
          }

          return (
            campaign && (
              <CampaignRow
                campaign={stringifyCampaignFields(campaign, localize)}
                key={campaign.id}
                context={{ phaseId }}
              />
            )
          );
        })}
    </Box>
  );
};

export default AdminPhaseEmailWrapper;
