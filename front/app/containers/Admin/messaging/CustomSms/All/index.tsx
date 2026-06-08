import React, { useState } from 'react';

import {
  Icon,
  Box,
  Title,
  Text,
  colors,
  StatusLabel,
} from '@citizenlab/cl2-component-library';

import { ICampaignData } from 'api/campaigns/types';
import useCampaigns from 'api/campaigns/useCampaigns';

import useLocalize from 'hooks/useLocalize';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { List, Row } from 'components/admin/ResourceList';
import Pagination from 'components/Pagination';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../../messages';

const smsStatus = (campaign: ICampaignData) => {
  if (campaign.attributes.delivery_stats) return 'sent';
  if (campaign.attributes.scheduled_at) return 'scheduled';
  return 'draft';
};

const NewSmsButton = () => {
  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="plus-circle"
      to="/admin/messaging/sms/custom/new"
      data-cy="e2e-new-sms-campaign-button"
    >
      <FormattedMessage {...messages.addSmsCampaignButton} />
    </ButtonWithLink>
  );
};

const CustomSms = () => {
  const localize = useLocalize();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: campaigns, fetchNextPage } = useCampaigns({
    channel: 'sms',
    manual: true,
    pageSize: 10,
  });

  const campaignsList = campaigns?.pages[currentPage - 1];

  if (!campaignsList) return null;

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
          <NewSmsButton />
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
            <FormattedMessage {...messages.textMessages} />
          </Title>
          <Text color="coolGrey600">
            <FormattedMessage {...messages.textMessagesDescription} />
          </Text>
        </Box>
        <ButtonWrapper>
          <NewSmsButton />
        </ButtonWrapper>
      </Box>

      <Box background={colors.white} p="40px">
        <List key={campaignsList.data.map((c) => c.id).join()}>
          {campaignsList.data.map((campaign) => {
            const status = smsStatus(campaign);
            return (
              <Row key={campaign.id}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  w="100%"
                >
                  <Box display="flex" alignItems="center" gap="12px">
                    <StatusLabel
                      backgroundColor={
                        status === 'sent' ? colors.success : colors.coolGrey300
                      }
                      text={<FormattedMessage {...messages[status]} />}
                    />
                    <Text m="0px" color="primary">
                      {localize(campaign.attributes.body_multiloc).slice(0, 80)}
                    </Text>
                  </Box>
                  <Link
                    to="/admin/messaging/sms/custom/$campaignId"
                    params={{ campaignId: campaign.id }}
                  >
                    <FormattedMessage {...messages.viewExample} />
                  </Link>
                </Box>
              </Row>
            );
          })}
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

export default CustomSms;
