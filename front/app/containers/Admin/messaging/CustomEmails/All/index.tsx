import React, { useState } from 'react';

import {
  Icon,
  Box,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useCampaigns from 'api/campaigns/useCampaigns';
import { isDraft } from 'api/campaigns/util';

import DraftCampaignRow from 'components/admin/Email/DraftCampaignRow';
import SentCampaignRow from 'components/admin/Email/SentCampaignRow';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List } from 'components/admin/ResourceList';
import Pagination from 'components/Pagination';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../../messages';

import NewCampaignButton from './NewCampaignButton';

const CustomEmails = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: campaigns, fetchNextPage } = useCampaigns({
    campaignNames: ['manual', 'manual_project_participants'],
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

  if (campaignsList.data.length === 0) {
    return (
      <Box background={colors.white} p="40px">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="80px 0 100px"
        >
          <Icon name="email-2" width="80px" height="80px" />
          <Title fontSize="xl" marginBottom="10px">
            <FormattedMessage {...messages.noCampaignsHeader} />
          </Title>
          <Text color="textSecondary" mb="30px" maxWidth="450px">
            <FormattedMessage {...messages.noCampaignsDescription} />
          </Text>
          <NewCampaignButton />
        </Box>
      </Box>
    );
  } else {
    return (
      <>
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
          <List key={campaignsList.data.map((c) => c.id).join()}>
            {campaignsList.data.map((campaign) =>
              isDraft(campaign) ? (
                <DraftCampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  context="global"
                />
              ) : (
                <SentCampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  context="global"
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
      </>
    );
  }
};

export default CustomEmails;
