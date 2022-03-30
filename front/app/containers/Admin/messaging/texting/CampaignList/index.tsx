import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import TextCampaignListRow from './TextCampaignListRow';

// resources
import useTextingCampaigns from 'hooks/useTextingCampaigns';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

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

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
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
      <NoCampaignsWrapper>
        <IconWrapper>
          <Icon name="messageBig" />
        </IconWrapper>
        <NoCampaignsHeader>
          <FormattedMessage {...messages.noTextingCampaignsHeader} />
        </NoCampaignsHeader>
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/messaging/texting/new"
        >
          <FormattedMessage {...messages.addTextButton} />
        </Button>
      </NoCampaignsWrapper>
    );
  }

  return (
    <>
      <ButtonWrapper>
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/messaging/texting/new"
        >
          <FormattedMessage {...messages.addTextButton} />
        </Button>
      </ButtonWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeader>Message</TableHeader>
            <TableHeader>Date sent</TableHeader>
            <TableHeader>Recipients</TableHeader>
            <StatusTableHeader>Status</StatusTableHeader>
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
    </>
  );
};

export default TextingCampaignsList;
