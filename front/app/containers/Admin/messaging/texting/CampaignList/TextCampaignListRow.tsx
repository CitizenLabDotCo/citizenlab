import React from 'react';

// components
import FormattedStatusLabel from '../components/FormattedStatusLabel';
import { Text } from '@citizenlab/cl2-component-library';

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
  height: 30px;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
`;

const BodyText = styled.p`
  min-width: 100px;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  text-decoration: underline;
`;

const SpacerCell = styled.td`
  min-width: 20px;
  width: 100%;
`;

const DateTime = styled.div`
  text-align: left;
  white-space: nowrap;
  margin-left: 20px;
`;

const SentText = styled.div`
  text-align: right;
  white-space: nowrap;
  margin-left: 20px;
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
      <td>
        <BodyText>{message}</BodyText>
      </td>
      <SpacerCell />
      <td>
        <FormattedStatusLabel campaignStatus={status} />
      </td>

      {status === 'sent' && (
        <>
          <td>
            <Text fontSize="s" color="adminTextColor">
              <DateTime>
                <FormattedDate value={sent_at} />
                &nbsp;
                <FormattedTime value={sent_at} />
              </DateTime>
            </Text>
          </td>
          <td>
            <SentText>
              <Text fontSize="s" color="adminTextColor">
                Sent to {phone_numbers.length.toLocaleString('en-US')}{' '}
                recipients
              </Text>
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
    </Row>
  );
};

export default TextingCampaignRow;
