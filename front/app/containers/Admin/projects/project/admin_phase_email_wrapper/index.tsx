import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import CampaignRow from 'containers/Admin/messaging/AutomatedEmails/CampaignRow';

import Centerer from 'components/UI/Centerer';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import usePhaseEmailCampaigns from './usePhaseEmailCampaigns';

const AdminPhaseEmailWrapper = () => {
  const { phaseId } = useParams({ strict: false });
  const { campaigns, loading } = usePhaseEmailCampaigns(phaseId);

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
        campaigns.map((campaign) => (
          <CampaignRow
            campaign={campaign}
            key={campaign.id}
            context={{ phaseId }}
          />
        ))}
    </Box>
  );
};

export default AdminPhaseEmailWrapper;
