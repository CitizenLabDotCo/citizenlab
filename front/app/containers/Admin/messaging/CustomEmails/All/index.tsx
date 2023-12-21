import React, { useState } from 'react';
import styled from 'styled-components';

import { isDraft } from 'api/campaigns/util';

import { FormattedMessage } from 'utils/cl-intl';

import { List } from 'components/admin/ResourceList';
import {
  Icon,
  Box,
  Title,
  Text,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';
import NewCampaignButton from './NewCampaignButton';

import messages from '../../messages';

import useCampaigns from 'api/campaigns/useCampaigns';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

const NoCampaignsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0 100px;
  text-align: center;
`;

const NoCampaignsHeader = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const NoCampaignsDescription = styled.p`
  color: ${colors.textSecondary};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

const CustomEmails = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: campaigns, fetchNextPage } = useCampaigns({
    campaignNames: ['manual'],
    pageSize: 10,
  });

  const campaignsList = campaigns?.pages[currentPage - 1];

  if (!campaignsList) return null;

  const lastPage = getPageNumberFromUrl(campaigns?.pages[0].links.last) || 1;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchNextPage({ pageParam: page });
  };

  if (campaignsList.data.length === 0) {
    return (
      <Box background={colors.white} p="40px">
        <NoCampaignsWrapper>
          <Icon name="email-2" width="80px" height="80px" />
          <NoCampaignsHeader>
            <FormattedMessage {...messages.noCampaignsHeader} />
          </NoCampaignsHeader>
          <NoCampaignsDescription>
            <FormattedMessage {...messages.noCampaignsDescription} />
          </NoCampaignsDescription>
          <NewCampaignButton />
        </NoCampaignsWrapper>
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
                <DraftCampaignRow key={campaign.id} campaign={campaign} />
              ) : (
                <SentCampaignRow key={campaign.id} campaign={campaign} />
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
