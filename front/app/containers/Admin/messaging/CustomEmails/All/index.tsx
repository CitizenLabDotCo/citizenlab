import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { isDraft } from 'services/campaigns';

import { FormattedMessage } from 'utils/cl-intl';

import { List } from 'components/admin/ResourceList';
import { Icon, Box } from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';
import NewCampaignButton from './NewCampaignButton';

import messages from '../../messages';

import { fontSizes, colors } from 'utils/styleUtils';

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

interface DataProps extends GetCampaignsChildProps {}

interface Props extends DataProps {}

const Campaigns = ({
  campaigns,
  currentPage,
  lastPage,
  onChangePage,
}: Props) => {
  if (isNilOrError(campaigns)) return null;

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
      <Box background={colors.white} p="40px">
        <ButtonWrapper>
          <NewCampaignButton />
        </ButtonWrapper>
        <List key={campaigns.map((c) => c.id).join()}>
          {campaigns.map((campaign) =>
            isDraft(campaign) ? (
              <DraftCampaignRow key={campaign.id} campaign={campaign} />
            ) : (
              <SentCampaignRow key={campaign.id} campaign={campaign} />
            )
          )}
        </List>
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          loadPage={onChangePage}
        />
      </Box>
    );
  }
};

export default () => (
  <GetCampaigns campaignNames={['manual']} pageSize={10}>
    {(campaigns) => <Campaigns {...campaigns} />}
  </GetCampaigns>
);
