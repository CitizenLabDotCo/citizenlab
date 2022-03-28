import React from 'react';

// components
import Link from 'utils/cl-router/Link';
import FormattedStatusLabel from '../components/FormattedStatusLabel';

// typings
import { ITextingCampaignData } from 'services/textingCampaigns';

// style
import styled from 'styled-components';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';

interface Props {
  campaign: ITextingCampaignData;
}

const Row = styled.tr`
  height: 30px;
  border-top: 1px solid #e0e0e0;
`;

const TextWrapper = styled.div`
  line-height: 40px;
`;

const Text = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  text-decoration: underline;
`;

const DateTime = styled.div`
  text-align: left;
  white-space: nowrap;
  margin-left: 20px;
`;

const StatusText = styled.div`
  text-align: right;
  white-space: nowrap;
  margin-left: 20px;
`;

const SpacerCell = styled.td`
  width: 100%;
`;

const TextingCampaignRow = ({ campaign }: Props) => {
  const {
    id,
    attributes: { message, phone_numbers, status, sent_at },
  } = campaign;

  return (
    <Row>
      <td>
        <TextWrapper>
          <Text>
            <Link to={`/admin/messaging/texting/${id}`}>{message}</Link>
          </Text>
        </TextWrapper>
      </td>
      <SpacerCell />
      <td>
        <FormattedStatusLabel campaignStatus={status} />
      </td>
      {status === 'draft' && (
        <>
          <td />
          <td />
        </>
      )}

      {status === 'sent' && (
        <>
          <td>
            <DateTime>
              <FormattedDate value={sent_at} />
              &nbsp;
              <FormattedTime value={sent_at} />
            </DateTime>
          </td>
          <td>
            <StatusText>
              <p>
                Sent to {phone_numbers.length.toLocaleString('en-US')}{' '}
                recipients
              </p>
            </StatusText>
          </td>
        </>
      )}
    </Row>
  );
};

export default TextingCampaignRow;
