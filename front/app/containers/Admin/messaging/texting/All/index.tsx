import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { GetCampaignsChildProps } from 'resources/GetCampaigns';

import { FormattedMessage } from 'utils/cl-intl';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SendingCampaignRow from './SendingCampaignRow';
import SentCampaignRow from './SentCampaignRow';
import FailedCampaignRow from './FailedCampaignRow';

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

// const texting_campaigns = [];

const texting_campaigns = [
  {
    id: '1',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'Draft SMS message content',
        'fr-BE': 'Draft SMS message content',
        'nl-BE': 'Draft SMS message content',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'draft',
    },
  },
  {
    id: '2',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'Sending SMS message content',
        'fr-BE': 'Sending SMS message content',
        'nl-BE': 'Sending SMS message content',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'sending',
    },
  },
  {
    id: '3',
    attributes: {
      sent_at: '2021-12-28T12:22:34.697Z',
      body_multiloc: {
        en: 'Sent SMS message content',
        'fr-BE': 'Sent SMS message content',
        'nl-BE': 'Sent SMS message content',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'sent',
    },
  },
  {
    id: '4',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'Sent SMS message content. I am a longer message. I should be truncated to fifty, or less, characters.',
        'fr-BE': 'Sent SMS message content.',
        'nl-BE': 'Sent SMS message content',
      },
      phone_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      status: 'sent',
    },
  },
  {
    id: '5',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'Failed SMS message content. I am a failure. I am not worthy. I also should be truncated to fifty, or less, characters.',
        'fr-BE': 'Failed SMS message content',
        'nl-BE': 'Failed SMS message content',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'failed',
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
              linkTo="/admin/messaging/emails/custom/new" // TODO: Link to texting/new when it exists
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
        <List key={texting_campaigns.map((c) => c.id).join()}>
          {texting_campaigns.map((campaign) => {
            switch (campaign.attributes.status) {
              case 'draft':
                return <DraftCampaignRow campaign={campaign} />;
              case 'sent':
                return <SentCampaignRow campaign={campaign} />;
              case 'sending':
                return <SendingCampaignRow campaign={campaign} />;
              case 'failed':
                return <FailedCampaignRow campaign={campaign} />;
              default:
                return null;
            }
          })}
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
