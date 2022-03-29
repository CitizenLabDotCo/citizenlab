import React from 'react';

// components
import FormattedStatusLabel from '../components/FormattedStatusLabel';

// typings
import { ITextingCampaignData } from 'services/textingCampaigns';

// style
import styled from 'styled-components';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';

// utils
import clHistory from 'utils/cl-router/history';

interface Props {
  campaign: ITextingCampaignData;
}

const Row = styled.tr`
  height: 50px;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
`;

const BodyText = styled.div`
  margin-right: 20px;
`;

const DateTime = styled.div`
  text-align: left;
  white-space: nowrap;
  margin-right: 20px;
`;

const SentText = styled.div`
  text-align: right;
  white-space: nowrap;
  margin-right: 20px;
`;

const TextCell = styled.td`
  width: 70%;
  margin-left: 20px;
  font-size: 16px;
  white-space: normal;
  word-break: break-all;
  text-decoration: underline;
`;

const TextingCampaignRow = ({ campaign }: Props) => {
  const {
    id,
    attributes: { message, phone_numbers, status, sent_at },
  } = campaign;

  const handleEvent = () => {
    clHistory.push(`/admin/messaging/texting/${id}`);
  };

  return (
    <Row onClick={handleEvent}>
      <TextCell>
        <BodyText>{message}</BodyText>
      </TextCell>

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
            <SentText>
              <p>
                Sent to {phone_numbers.length.toLocaleString('en-US')}{' '}
                recipients
              </p>
            </SentText>
          </td>
        </>
      )}

      {status !== 'sent' && (
        <>
          <td />
          <td />
        </>
      )}

      <td>
        <FormattedStatusLabel campaignStatus={status} />
      </td>
    </Row>
  );
};

export default TextingCampaignRow;
