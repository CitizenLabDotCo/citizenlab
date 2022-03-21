import React from 'react';

// routing
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';
import messages from '../../messages';
import Button from 'components/UI/Button';

// typings
import { ITextingCampaignData } from 'services/textingCampaigns';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  campaign: ITextingCampaignData;
}

const Container = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e0e0e0;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const TextWrapper = styled.div`
  line-height: 50px;
`;

const Text = styled.p`
  width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
`;

const Right = styled.div`
  display: flex;
  gap: 30px;
`;

// 140px is sufficient for longest date-time string
const DateTime = styled.div`
  width: 140px;
`;

// 174px is sufficient for 999,999 recipients
const StatusWrapper = styled.div`
  width: 174px;
  text-align: right;
`;

const TextingCampaignRow = ({ campaign }: Props & WithRouterProps) => {
  const { status } = campaign.attributes;

  let formattedStatusLabel;

  switch (status) {
    case 'draft':
      formattedStatusLabel = (
        <StatusLabel
          backgroundColor={colors.adminOrangeIcons}
          text={<FormattedMessage {...messages.draft} />}
        />
      );
      break;
    case 'sending':
      formattedStatusLabel = (
        <StatusLabel
          backgroundColor={colors.adminMenuBackground}
          text={<FormattedMessage {...messages.sending} />}
        />
      );
      break;
    case 'sent':
      formattedStatusLabel = (
        <StatusLabel
          backgroundColor={colors.clGreenSuccess}
          text={<FormattedMessage {...messages.sent} />}
        />
      );
      break;
    case 'failed':
      formattedStatusLabel = (
        <StatusLabel
          backgroundColor={colors.clRedError}
          text={<FormattedMessage {...messages.failed} />}
        />
      );
  }

  return (
    <Container id={campaign.id}>
      <Left>
        <TextWrapper>
          <Text>
            <Link to={`/${campaign.id}`}>{campaign.attributes.body}</Link>
          </Text>
        </TextWrapper>
        {formattedStatusLabel}
      </Left>
      <Right>
        {status == 'sent' && (
          <>
            <DateTime>
              <FormattedDate value={campaign.attributes.sent_at} />
              &nbsp;
              <FormattedTime value={campaign.attributes.sent_at} />
            </DateTime>
            <StatusWrapper>
              <p>
                Sent to{' '}
                {campaign.attributes.phone_numbers.length.toLocaleString(
                  'en-US'
                )}{' '}
                recipients
              </p>
            </StatusWrapper>
          </>
        )}
        {status == 'draft' && (
          <>
            <Button
              linkTo={`/admin/messaging/texting/${campaign.id}`}
              buttonStyle="secondary"
              icon="edit"
            >
              <FormattedMessage {...messages.manageButtonLabel} />
            </Button>
          </>
        )}
      </Right>
    </Container>
  );
};

export default withRouter(TextingCampaignRow);
