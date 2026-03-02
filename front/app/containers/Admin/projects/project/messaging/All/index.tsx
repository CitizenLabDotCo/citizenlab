import React, { useState } from 'react';

import {
  Icon,
  Box,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaigns from 'api/campaigns/useCampaigns';
import { isDraft, isScheduled } from 'api/campaigns/util';

import DraftCampaignRow from 'components/admin/Email/DraftCampaignRow';
import ScheduledCampaignRow from 'components/admin/Email/ScheduledCampaignRow';
import SentCampaignRow from 'components/admin/Email/SentCampaignRow';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List } from 'components/admin/ResourceList';
import Pagination from 'components/Pagination';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../messages';

import NewCampaignButton from './NewCampaignButton';

const CustomEmails = () => {
  const { projectId } = useParams() as { projectId: string };
  const [currentPage, setCurrentPage] = useState(1);
  const { data: campaigns, fetchNextPage } = useCampaigns({
    context: { projectId },
    pageSize: 10,
  });

  const campaignsList = campaigns?.pages[currentPage - 1];

  if (!campaignsList) return null;

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const lastPage = getPageNumberFromUrl(campaigns?.pages[0].links.last) || 1;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchNextPage({ pageParam: page });
  };

  // Sort campaigns: drafts first, then scheduled (nearest to farthest), then sent (newest to oldest)
  const sortedCampaigns = [...campaignsList.data].sort((a, b) => {
    // Priority: 0 = draft, 1 = scheduled, 2 = sent
    const getPriority = (c) => (isDraft(c) ? 0 : isScheduled(c) ? 1 : 2);
    const priorityDiff = getPriority(a) - getPriority(b);

    if (priorityDiff !== 0) return priorityDiff;

    // Within same priority, sort by date
    if (isScheduled(a)) {
      return (
        new Date(a.attributes.scheduled_at || 0).getTime() -
        new Date(b.attributes.scheduled_at || 0).getTime()
      );
    }

    return (
      new Date(b.attributes.updated_at).getTime() -
      new Date(a.attributes.updated_at).getTime()
    );
  });

  if (campaignsList.data.length === 0) {
    return (
      <Box p="44px">
        <Box background={colors.white} p="40px">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="80px 0 100px"
          >
            <Icon name="email-2" width="80px" height="80px" />
            <Title fontSize="xl" marginBottom="10px" color="primary">
              <FormattedMessage {...messages.noCampaignsHeader} />
            </Title>
            <Text color="textSecondary" mb="30px" maxWidth="450px">
              <FormattedMessage {...messages.noCampaignsDescription} />
            </Text>
            <NewCampaignButton />
          </Box>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box p="44px">
        <Box
          mb="28px"
          display="flex"
          w="100%"
          justifyContent="space-between"
          pb="28px"
        >
          <Box>
            <Title color="primary">
              <FormattedMessage {...messages.customEmails} />
            </Title>
            <Text color="coolGrey600">
              <FormattedMessage {...messages.customEmailsDescription} />
            </Text>
          </Box>
          <ButtonWrapper>
            <NewCampaignButton />
          </ButtonWrapper>
        </Box>

        <Box background={colors.white} p="40px">
          <List key={sortedCampaigns.map((c) => c.id).join()}>
            {sortedCampaigns.map((campaign) =>
              isDraft(campaign) ? (
                <DraftCampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  context="project"
                />
              ) : isScheduled(campaign) ? (
                <ScheduledCampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  context="project"
                />
              ) : (
                <SentCampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  context="project"
                />
              )
            )}
          </List>
          {lastPage > 1 && (
            <Box pb="42px" pt="5px">
              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                loadPage={goToPage}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  }
};

export default CustomEmails;
