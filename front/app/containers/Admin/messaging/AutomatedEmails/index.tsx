import React, { useState, useMemo } from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import { internalCommentNotificationTypes } from 'api/campaigns/types';
import useCampaigns from 'api/campaigns/useCampaigns';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import CampaignRow from './CampaignRow';
import ExampleModal from './ExampleModal';
import {
  CampaignData,
  GroupedCampaignsEntry,
  SubGroupedCampaignsEntry,
} from './types';
import { groupBy, sortBy, stringifyCampaignFields } from './utils';
import EditModal from 'containers/Admin/messaging/AutomatedEmails/EditModal';

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
  const [editModalCampaignId, setEditModalCampaignId] = useState<string | null>(
    null
  );

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

  const handleOnClickEdit = (campaignId: string) => () => {
    setEditModalCampaignId(campaignId);
  };

  return (
    <Box className="intercom-messaging-automated-emails-page">
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
              onClickEdit={handleOnClickEdit}
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
      {editModalCampaignId && (
        <EditModal
          campaignId={editModalCampaignId}
          onClose={() => setEditModalCampaignId(null)}
        />
      )}
    </Box>
  );
};

type CampaignsGroupProps = {
  subGroupedCampaignsEntry: SubGroupedCampaignsEntry;
  onClickViewExample: (campaignId: string) => () => void;
  onClickEdit: (campaignId: string) => () => void;
};
const CampaignsGroup = ({
  subGroupedCampaignsEntry: [recipient_role, group],
  onClickViewExample,
  onClickEdit,
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
        onClickEdit={onClickEdit}
      />
    ))}
  </Box>
);

type CampaignsSubGroupProps = {
  groupedCampaignsEntry: GroupedCampaignsEntry;
  onClickViewExample: (campaignId: string) => () => void;
  onClickEdit: (campaignId: string) => () => void;
};
const CampaignsSubGroup = ({
  groupedCampaignsEntry: [content_type, campaigns],
  onClickViewExample,
  onClickEdit,
}: CampaignsSubGroupProps) => (
  <Box>
    <Title color="primary" variant="h4" mt="24px">
      {content_type}
    </Title>
    {campaigns.map((campaign: CampaignData) => (
      <CampaignRow
        campaign={campaign}
        key={campaign.id}
        onClickViewExample={onClickViewExample(campaign.id)}
        onClickEdit={onClickEdit(campaign.id)}
      />
    ))}
  </Box>
);

export default AutomatedEmails;
