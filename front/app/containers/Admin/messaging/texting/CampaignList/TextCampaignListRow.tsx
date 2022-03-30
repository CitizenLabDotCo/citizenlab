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
import { truncate } from 'utils/textUtils';

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
  text-align: left;
  white-space: nowrap;
  margin-right: 20px;
`;

const Cell = styled.td`
  padding-right: 20px;
`;

const MessageCell = styled(Cell)`
  width: 67%;
  margin-left: 20px;
  font-size: 16px;
  white-space: normal;
  word-break: break-all;
  text-decoration: underline;
`;

const StatusCell = styled(Cell)`
  padding-right: 0;
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
      <MessageCell>
        <BodyText>{truncate(message, 60)}</BodyText>
      </MessageCell>

      {status === 'sent' && (
        <>
          <Cell>
            <DateTime>
              <FormattedDate value={sent_at} />
              &nbsp;
              <FormattedTime value={sent_at} />
            </DateTime>
          </Cell>
          <Cell>
            <SentText>
              <p>{phone_numbers.length}</p>
            </SentText>
          </Cell>
        </>
      )}

      {status !== 'sent' && (
        <>
          <Cell />
          <Cell />
        </>
      )}

      <StatusCell>
        <FormattedStatusLabel campaignStatus={status} />
      </StatusCell>
    </Row>
  );
};

export default TextingCampaignRow;
