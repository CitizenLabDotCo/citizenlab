import React from 'react';

// style
import { fontSizes } from '@citizenlab/cl2-component-library';
import { FormattedTime, FormattedDate } from 'react-intl';
import styled from 'styled-components';

import clHistory from 'utils/cl-router/history';
import { truncate } from 'utils/textUtils';

import { ITextingCampaignData } from 'api/texting_campaigns/types';

import FormattedStatusLabel from '../components/FormattedStatusLabel';

interface Props {
  campaign: ITextingCampaignData;
}

const Row = styled.tr`
  height: 50px;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
`;

const Cell = styled.td`
  padding-right: 20px;
`;

const MetaInfoCell = styled(Cell)`
  text-align: left;
  white-space: nowrap;
`;

const MessageCell = styled(Cell)`
  width: 67%;
  font-size: ${fontSizes.base}px;
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
    <Row tabIndex={0} onClick={handleEvent}>
      <MessageCell>{truncate(message, 60)}</MessageCell>

      {status === 'sent' && sent_at && (
        <>
          <MetaInfoCell>
            <FormattedDate value={sent_at} />
            &nbsp;
            <FormattedTime value={sent_at} />
          </MetaInfoCell>
          <MetaInfoCell>{phone_numbers.length}</MetaInfoCell>
        </>
      )}

      {status !== 'sent' && (
        <>
          <Cell />
          <Cell />
        </>
      )}

      <StatusCell>
        <FormattedStatusLabel width="100px" campaignStatus={status} />
      </StatusCell>
    </Row>
  );
};

export default TextingCampaignRow;
