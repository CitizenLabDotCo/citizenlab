import React from 'react';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';
import messages from '../../messages';
import Link from 'utils/cl-router/Link';

// typings
import {
  ITextingCampaignData,
  ITextingCampaignStatuses,
} from 'services/textingCampaigns';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  campaign: ITextingCampaignData;
}

interface FormattedStatusLabelProps {
  campaignStatus: ITextingCampaignStatuses;
}

const TextWrapper = styled.div`
  line-height: 40px;
`;

const Text = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
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

const FormattedStatusLabel = (
  props: FormattedStatusLabelProps
): JSX.Element | null => {
  switch (props.campaignStatus) {
    case 'draft':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.adminOrangeIcons}
          text={<FormattedMessage {...messages.draft} />}
        />
      );
    case 'sending':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.adminMenuBackground}
          text={<FormattedMessage {...messages.sending} />}
        />
      );
    case 'sent':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.clGreenSuccess}
          text={<FormattedMessage {...messages.sent} />}
        />
      );
    case 'failed':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.clRedError}
          text={<FormattedMessage {...messages.failed} />}
        />
      );
    default:
      return null;
  }
};

const TextingCampaignRow = ({ campaign }: Props) => {
  const {
    id,
    attributes: { message, phone_numbers, status, sent_at },
  } = campaign;

  return (
    <tr>
      <td>
        <TextWrapper>
          <Text>
            <Link to={`/admin/messaging/texting/${id}`}>{message}</Link>
          </Text>
        </TextWrapper>
      </td>
      <SpacerCell></SpacerCell>
      <td>
        <FormattedStatusLabel campaignStatus={status} />
      </td>
      {status === 'draft' && (
        <>
          <td></td>
          <td></td>
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
    </tr>
  );
};

export default TextingCampaignRow;
