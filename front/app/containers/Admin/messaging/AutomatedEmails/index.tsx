import React, { useState, useMemo } from 'react';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import useCampaigns from 'api/campaigns/useCampaigns';
import useLocalize from 'hooks/useLocalize';
import ExampleModal from './ExampleModal';
import { groupBy, sortBy, stringifyCampaignFields } from './utils';
import {
  CampaignData,
  GroupedCampaignsEntry,
  SubGroupedCampaignsEntry,
} from './types';
import CampaignRow from './CampaignRow';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { internalCommentNotificationTypes } from 'api/campaigns/types';

const AutomatedEmails = () => {
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });

  const { data: campaigns } = useCampaigns({
    withoutCampaignNames: [
      'manual',
      'invite_received',
      ...(isInternalCommentingEnabled ? [] : internalCommentNotificationTypes),
    ],
    pageSize: 250,
  });

  const localize = useLocalize();
  const [exampleModalCampaignId, setExampleModalCampaignId] = useState<
    string | null
  >(null);

  const groupedCampaigns = useMemo(
    () =>
      campaigns?.pages
        .flatMap((page) => page.data)
        .map(
          (campaign): CampaignData =>
            stringifyCampaignFields(campaign, localize)
        )
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

  const handleOnClickViewExample = (campaignId: string) => () => {
    setExampleModalCampaignId(campaignId);
  };

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
              onClickViewExample={handleOnClickViewExample}
            />
          )
        )}
      </Box>
      {exampleModalCampaignId && (
        <ExampleModal
          campaignId={exampleModalCampaignId}
          onClose={() => setExampleModalCampaignId(null)}
        />
      )}
    </>
  );
};

type CampaignsGroupProps = {
  subGroupedCampaignsEntry: SubGroupedCampaignsEntry;
  onClickViewExample: (campaignId: string) => () => void;
};
const CampaignsGroup = ({
  subGroupedCampaignsEntry: [recipient_role, group],
  onClickViewExample,
}: CampaignsGroupProps) => (
  <Box mb="30px">
    <Title color="primary" variant="h3" mt="20px">
      {recipient_role}
    </Title>
    {group.map((groupedCampaignsEntry: GroupedCampaignsEntry) => (
      <CampaignsSubGroup
        key={groupedCampaignsEntry[0]}
        groupedCampaignsEntry={groupedCampaignsEntry}
        onClickViewExample={onClickViewExample}
      />
    ))}
  </Box>
);

type CampaignsSubGroupProps = {
  groupedCampaignsEntry: GroupedCampaignsEntry;
  onClickViewExample: (campaignId: string) => () => void;
};
const CampaignsSubGroup = ({
  groupedCampaignsEntry: [content_type, campaigns],
  onClickViewExample,
}: CampaignsSubGroupProps) => (
  <Box>
    <Title color="primary" variant="h4" mt="24px" fontWeight="normal">
      {content_type}
    </Title>
    {campaigns.map((campaign: CampaignData) => (
      <CampaignRow
        campaign={campaign}
        key={campaign.id}
        onClickViewExample={onClickViewExample(campaign.id)}
      />
    ))}
  </Box>
);

export default AutomatedEmails;
