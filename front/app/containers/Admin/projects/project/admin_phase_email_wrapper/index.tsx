import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import useEmailCampaigns from 'api/campaigns/email/useEmailCampaigns';
import useSupportedEmailCampaignNames from 'api/campaigns/email/useSupportedEmailCampaignNames';

import useLocalize from 'hooks/useLocalize';

import CampaignRow from 'containers/Admin/messaging/AutomatedEmails/CampaignRow';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';

import Centerer from 'components/UI/Centerer';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

const AdminPhaseEmailWrapper = () => {
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false });
  const { data: supportedCampaigns, isLoading: loadingNames } =
    useSupportedEmailCampaignNames({
      phaseId,
    });
  const supportedCampaignNames = supportedCampaigns?.data.attributes || [];
  const { data: contextPages, isLoading: loadingContext } = useEmailCampaigns({
    ...(phaseId ? { context: { phaseId } } : {}),
    pageSize: 250,
  });
  const contextCampaigns = contextPages?.pages.flatMap((page) => page.data);
  const { data: supportedCampaignsPages, isLoading: loadingGlobal } =
    useEmailCampaigns({
      pageSize: 250,
    });
  const globalCampaigns = supportedCampaignsPages?.pages.flatMap(
    (page) => page.data
  );

  const loading = loadingNames || loadingContext || loadingGlobal;

  return (
    <Box>
      <Text color="coolGrey600" mt="0px" fontSize="m">
        <FormattedMessage {...messages.automatedEmailsDescription} />
      </Text>
      {loading && (
        <Centerer height="200px">
          <Spinner />
        </Centerer>
      )}
      {!loading &&
        supportedCampaignNames.length > 0 &&
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
