import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { Icon, Box } from '@citizenlab/cl2-component-library';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import TextCampaignListRow from './TextCampaignListRow';

// resources
import useTextingCampaigns from 'hooks/useTextingCampaigns';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';
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
  const textingCampaigns = useTextingCampaigns();

  if (isNilOrError(textingCampaigns)) return null;

  if (textingCampaigns.length === 0) {
    return (
      <Box background={colors.white} p="40px">
        <NoCampaignsWrapper>
          <Icon name="message" width="40px" height="40px" />
          <NoCampaignsHeader>
            <FormattedMessage {...messages.noTextingCampaignsHeader} />
          </NoCampaignsHeader>
          <Button
            buttonStyle="cl-blue"
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
          buttonStyle="cl-blue"
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
          {textingCampaigns.map((campaign) => {
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
