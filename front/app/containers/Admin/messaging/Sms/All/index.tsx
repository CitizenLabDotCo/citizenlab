import React, { useState } from 'react';

import {
  Icon,
  Box,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useSmsCampaigns from 'api/campaigns/sms/useSmsCampaigns';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List } from 'components/admin/ResourceList';
import Pagination from 'components/Pagination';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../../messages';

import NewSmsCampaignButton from './NewSmsCampaignButton';
import SmsCampaignRow from './SmsCampaignRow';

const SmsCampaigns = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: campaigns, fetchNextPage } = useSmsCampaigns({
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
            <FormattedMessage {...messages.noSmsCampaignsHeader} />
          </Title>
          <Text color="textSecondary" mb="30px" maxWidth="450px">
            <FormattedMessage {...messages.noSmsCampaignsDescription} />
          </Text>
          <NewSmsCampaignButton />
        </Box>
      </Box>
    );
  }

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
            <FormattedMessage {...messages.tabSms} />
          </Title>
          <Text color="coolGrey600">
            <FormattedMessage {...messages.smsCampaignsDescription} />
          </Text>
        </Box>
        <ButtonWrapper>
          <NewSmsCampaignButton />
        </ButtonWrapper>
      </Box>

      <Box background={colors.white} p="40px">
        <List key={campaignsList.data.map((c) => c.id).join()}>
          {campaignsList.data.map((campaign) => (
            <SmsCampaignRow key={campaign.id} campaign={campaign} />
          ))}
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
};

export default SmsCampaigns;
