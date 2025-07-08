import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaigns from 'api/campaigns/useCampaigns';
import useSupportedCampaignTypes from 'api/campaigns/useSupportedCampaignTypes';

import useLocalize from 'hooks/useLocalize';

import CampaignRow from 'containers/Admin/messaging/AutomatedEmails/CampaignRow';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';

const AdminPhaseEmailWrapper = () => {
  const localize = useLocalize();
  const { phaseId } = useParams();
  const supportedCampaignTypes =
    useSupportedCampaignTypes({ phaseId }).data?.data.attributes || [];
  const contextCampaigns = useCampaigns({
    ...(phaseId ? { phaseId } : {}),
    pageSize: 250,
  }).data?.pages.flatMap((page) => page.data);
  const globalCampaigns = useCampaigns({ pageSize: 250 }).data?.pages.flatMap(
    (page) => page.data
  );
  // .filter((campaign): campaign is ICampaignData => !!campaign);
  return (
    <Box>
      {supportedCampaignTypes.length > 0 &&
        supportedCampaignTypes.map((campaignType) => {
          const contextCampaign = contextCampaigns?.find(
            (campaign) => campaign.attributes.campaign_name === campaignType
          );
          const globalCampaign = globalCampaigns?.find(
            (campaign) => campaign.attributes.campaign_name === campaignType
          );
          const campaign = contextCampaign || globalCampaign;
          const globalEnabled = globalCampaign?.attributes.enabled;

          return (
            campaign && (
              <CampaignRow
                campaign={stringifyCampaignFields(campaign, localize)}
                key={campaign.id}
                phaseId={phaseId}
                globalEnabled={globalEnabled}
                // onClickViewExample={onClickViewExample(campaign.id)}
              />
            )
          );
        })}
    </Box>
  );
};

export default AdminPhaseEmailWrapper;
