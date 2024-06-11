import React from 'react';

import {
  Icon,
  Box,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useTextingCampaigns from 'api/texting_campaigns/useTextingCampaigns';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import TextCampaignListRow from './TextCampaignListRow';

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
  margin-bottom: 20px;
`;

const Table = styled.table`
  table-layout: auto;
  width: 100%;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 15px 0;
  font-size: ${fontSizes.base}px;
  padding-right: 20px;
`;

const StatusTableHeader = styled(TableHeader)`
  padding-right: 0;
`;

const TextingCampaignsList = () => {
  const { data: textingCampaigns } = useTextingCampaigns();

  if (isNilOrError(textingCampaigns)) return null;

  if (textingCampaigns.data.length === 0) {
    return (
      <Box background={colors.white} p="40px">
        <NoCampaignsWrapper>
          <Icon name="message" width="40px" height="40px" />
          <NoCampaignsHeader>
            <FormattedMessage {...messages.noTextingCampaignsHeader} />
          </NoCampaignsHeader>
          <Button
            buttonStyle="admin-dark"
            icon="plus-circle"
            linkTo="/admin/messaging/texting/new"
            id="e2e-add-text-campaign-button"
          >
            <FormattedMessage {...messages.addTextButton} />
          </Button>
        </NoCampaignsWrapper>
      </Box>
    );
  }

  return (
    <Box background={colors.white} p="40px">
      <ButtonWrapper>
        <Button
          buttonStyle="admin-dark"
          icon="plus-circle"
          linkTo="/admin/messaging/texting/new"
          id="e2e-add-text-campaign-button"
        >
          <FormattedMessage {...messages.addTextButton} />
        </Button>
      </ButtonWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeader>
              <FormattedMessage {...messages.message} />
            </TableHeader>
            <TableHeader>
              <FormattedMessage {...messages.dateSent} />
            </TableHeader>
            <TableHeader>
              <FormattedMessage {...messages.recipients} />
            </TableHeader>
            <StatusTableHeader>
              <FormattedMessage {...messages.status} />
            </StatusTableHeader>
          </tr>
        </thead>
        <tbody>
          {textingCampaigns.data.map((campaign) => {
            return (
              <TextCampaignListRow key={campaign.id} campaign={campaign} />
            );
          })}
        </tbody>
      </Table>
    </Box>
  );
};

export default TextingCampaignsList;
