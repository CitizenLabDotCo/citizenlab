import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';

import useAddCampaign from 'api/campaigns/useAddCampaign';
import useCampaigns from 'api/campaigns/useCampaigns';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  projectId: string;
}

const EmailNotificationsSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addCampaign } = useAddCampaign();
  const { mutate: updateCampaign } = useUpdateCampaign();

  const { data: contextCampaignsPages } = useCampaigns({
    context: { projectId },
    pageSize: 250,
  });
  const { data: globalCampaignsPages } = useCampaigns({ pageSize: 250 });

  const contextCampaigns = contextCampaignsPages?.pages.flatMap(
    (page) => page.data
  );
  const globalCampaigns = globalCampaignsPages?.pages.flatMap(
    (page) => page.data
  );

  let projectPublishedCampaign = contextCampaigns?.find(
    (c) => c.attributes.campaign_name === 'project_published'
  );
  if (!projectPublishedCampaign) {
    projectPublishedCampaign = globalCampaigns?.find(
      (c) => c.attributes.campaign_name === 'project_published'
    );
  }

  const isEnabled = projectPublishedCampaign?.attributes.enabled ?? true;
  const unpersistedContextCampaign =
    projectPublishedCampaign &&
    !projectPublishedCampaign.relationships.context?.data?.id;

  const toggleEmailEnabled = () => {
    if (!projectPublishedCampaign) return;

    if (unpersistedContextCampaign) {
      addCampaign({
        context: { projectId },
        campaign_name: 'project_published',
        enabled: !isEnabled,
      });
    } else {
      updateCampaign({
        id: projectPublishedCampaign.id,
        campaign: {
          enabled: !isEnabled,
        },
      });
    }
  };

  return (
    <Box mb="24px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Text fontWeight="bold" mb="4px">
            {formatMessage(messages.sendEmailNotifications)}
          </Text>
          {isEnabled && (
            <Box display="flex" alignItems="center" gap="4px" flexWrap="wrap">
              <Text
                color="grey700"
                fontSize="s"
                textDecoration="underline"
                style={{ cursor: 'pointer' }}
              >
                {formatMessage(messages.editRecipients)}
              </Text>
              <Text color="grey700" fontSize="s">
                &middot;
              </Text>
              <Text
                color="grey700"
                fontSize="s"
                textDecoration="underline"
                style={{ cursor: 'pointer' }}
              >
                {formatMessage(messages.editEmail)}
              </Text>
            </Box>
          )}
        </Box>
        <Toggle checked={isEnabled} onChange={toggleEmailEnabled} />
      </Box>
    </Box>
  );
};

export default EmailNotificationsSection;
