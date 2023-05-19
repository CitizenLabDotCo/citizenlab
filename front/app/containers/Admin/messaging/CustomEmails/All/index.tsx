import React from 'react';
import styled from 'styled-components';

import { isDraft } from 'services/campaigns';

import { FormattedMessage } from 'utils/cl-intl';

import { List } from 'components/admin/ResourceList';
import { Icon, Box, Title, Text } from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';
import NewCampaignButton from './NewCampaignButton';

import messages from '../../messages';

import { fontSizes, colors } from 'utils/styleUtils';
import useCampaigns from 'api/campaigns/useCampaigns';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { useLocation, useParams } from 'react-router-dom';
import { parse } from 'qs';
import clHistory from 'utils/cl-router/history';

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
  const location = useLocation();
  const query = parse(location.search, { ignoreQueryPrefix: true });
  const pageNumber = query.pageNumber;
  const pageNumberInt = pageNumber ? parseInt(pageNumber as string, 10) : 1;

  const { data } = useCampaigns({
    campaignNames: ['manual'],
    pageNumber: pageNumberInt,
    pageSize: 2,
  });
  if (!data) return null;

  const campaigns = data.data;
  const lastPage = getPageNumberFromUrl(data.links.last) || 1;

  if (campaigns.length === 0) {
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
        <Box mb="28px" display="flex" w="100%" justifyContent="space-between">
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
          <List key={campaigns.map((c) => c.id).join()}>
            {campaigns.map((campaign) =>
              isDraft(campaign) ? (
                <DraftCampaignRow key={campaign.id} campaign={campaign} />
              ) : (
                <SentCampaignRow key={campaign.id} campaign={campaign} />
              )
            )}
          </List>
          <Pagination currentPage={pageNumberInt} totalPages={lastPage} />
        </Box>
      </>
    );
  }
};

export default CustomEmails;
