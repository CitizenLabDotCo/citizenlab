import React, { useMemo } from 'react';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import useCampaigns from 'api/campaigns/useCampaigns';
import useLocalize from 'hooks/useLocalize';
import { groupBy, sortBy } from './utils';
import {
  CampaignData,
  GroupedCampaignsEntry,
  SubGroupedCampaignsEntry,
} from './types';
import CampaignRow from './CampaignRow';

const AutomatedEmails = () => {
  const { data: campaigns } = useCampaigns({
    withoutCampaignNames: ['manual', 'invite_received'],
    pageSize: 250,
  });

  const localize = useLocalize();

  const groupedCampaigns = useMemo(
    () =>
      campaigns?.pages
        .flatMap((page) => page.data)
        .map((campaign): CampaignData => {
          const {
            content_type_multiloc,
            recipient_role_multiloc,
            recipient_segment_multiloc,
            trigger_multiloc,
            campaign_description_multiloc,
            schedule_multiloc,
          } = campaign.attributes;

          return {
            content_type: localize(content_type_multiloc),
            recipient_role: localize(recipient_role_multiloc),
            recipient_segment: localize(recipient_segment_multiloc),
            campaign_description: localize(campaign_description_multiloc),
            trigger: trigger_multiloc && localize(trigger_multiloc),
            schedule: schedule_multiloc && localize(schedule_multiloc),
            ...campaign,
          };
        })
        .reduce(groupBy('recipient_role'), [])
        .sort(sortBy('recipient_role'))
        .map(([recipient_role, group]: GroupedCampaignsEntry) => [
          recipient_role,
          group
            .reduce(groupBy('content_type'), [])
            .sort(sortBy('content_type')),
        ]),
    [campaigns, localize]
  );

  if (!groupedCampaigns) return null;

  return (
    <>
      <Box mb="28px">
        <Title color="primary">
          <FormattedMessage {...messages.automatedEmails} />
        </Title>
        <Text color="coolGrey600">
          <FormattedMessage {...messages.automatedEmailCampaignsInfo} />
        </Text>
      </Box>
      <Box background={colors.white} p="12px 40px">
        {groupedCampaigns.map(
          (subGroupedCampaignsEntry: SubGroupedCampaignsEntry) => (
            <CampaignsGroup
              key={subGroupedCampaignsEntry[0]}
              subGroupedCampaignsEntry={subGroupedCampaignsEntry}
            />
          )
        )}
      </Box>
    </>
  );
};

type CampaignsGroupProps = {
  subGroupedCampaignsEntry: SubGroupedCampaignsEntry;
};
const CampaignsGroup = ({
  subGroupedCampaignsEntry: [recipient_role, group],
}: CampaignsGroupProps) => (
  <Box mb="30px">
    <Title color="primary" variant="h3" mt="20px">
      {recipient_role}
    </Title>
    {group.map((groupedCampaignsEntry: GroupedCampaignsEntry) => (
      <CampaignsSubGroup
        key={groupedCampaignsEntry[0]}
        groupedCampaignsEntry={groupedCampaignsEntry}
      />
    ))}
  </Box>
);

type CampaignsSubGroupProps = {
  groupedCampaignsEntry: GroupedCampaignsEntry;
};
const CampaignsSubGroup = ({
  groupedCampaignsEntry: [content_type, campaigns],
}: CampaignsSubGroupProps) => (
  <Box>
    <Title color="primary" variant="h4" mt="24px" fontWeight="normal">
      {content_type}
    </Title>
    {campaigns.map((campaign: CampaignData) => (
      <CampaignRow campaign={campaign} key={campaign.id} />
    ))}
  </Box>
);

export default AutomatedEmails;
