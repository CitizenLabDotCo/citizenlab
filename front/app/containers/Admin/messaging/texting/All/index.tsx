import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { isDraft } from 'services/textingCampaigns';

import { FormattedMessage } from 'utils/cl-intl';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';

import messages from '../../messages';

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
  margin-bottom: 10px;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;

const texting_campaigns = [];

const texting_campaigns2 = [
  {
    id: '1',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'test sent text',
        'fr-BE': 'test sent text',
        'nl-BE': 'test sent text',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'sent',
    },
  },
  {
    id: '2',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'test draft text',
        'fr-BE': 'test draft text',
        'nl-BE': 'test draft text',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'draft',
    },
  },
];

interface InputProps {}

interface DataProps extends GetCampaignsChildProps {}

export interface Props extends InputProps, DataProps {}

class TextingCampaigns extends React.Component<Props> {
  render() {
    const { currentPage, lastPage } = this.props;

    if (isNilOrError(texting_campaigns)) return null;

    if (texting_campaigns.length === 0) {
      return (
        <>
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
              linkTo="/admin/messaging/emails/custom/new"
            >
              <FormattedMessage {...messages.addTextButton} />
            </Button>
          </NoCampaignsWrapper>
        </>
      );
    }

    return (
      <>
        <ButtonWrapper>
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            linkTo="/admin/messaging/emails/custom/new" // TODO: Link to texting/new when it exists
          >
            <FormattedMessage {...messages.addTextButton} />
          </Button>
        </ButtonWrapper>
        <List key={texting_campaigns2.map((c) => c.id).join()}>
          {texting_campaigns2.map((campaign) =>
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
          loadPage={this.props.onChangePage}
        />
      </>
    );
  }
}

export default TextingCampaigns;
