import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import FormattedStatusLabel from '../components/FormattedStatusLabel';
import RemainingCharacters from '../components/RemainingCharacters';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';

// utils
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';

// hooks
import useTextingCampaign from 'hooks/useTextingCampaign';

// services
import {
  updateTextingCampaign,
  ITextingCampaignData,
  ITextingCampaignStatuses,
} from 'services/textingCampaigns';

// styling
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledForm = styled.form`
  width: 500px;
`;

// enough to fit 3 messages, actual functionality TBD in subsequent ticket
const MAX_CHAR_COUNT = 480;

const getTitleMessage = (campaignStatus: ITextingCampaignStatuses) => {
  switch (campaignStatus) {
    case 'draft':
      return 'Draft SMS Campaign';
    case 'sending':
      return 'Sending SMS Campaign';
    case 'sent':
      return 'Sent SMS Campaign';
    case 'failed':
      return 'Failed SMS Campaign';
    default:
      return 'Created SMS Campaign';
  }
};

const getAdditionalInfoByStatus = (campaign: ITextingCampaignData) => {
  switch (campaign.attributes.status) {
    case 'draft':
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    case 'sending':
      return (
        <>
          Began sending at:{' '}
          <FormattedTime value={campaign.attributes.updated_at} />,{' '}
          <FormattedDate value={campaign.attributes.updated_at} />
        </>
      );
    case 'sent':
      return (
        <>
          Sent at: <FormattedTime value={campaign.attributes.sent_at} />,{' '}
          <FormattedDate value={campaign.attributes.sent_at} />,
        </>
      );
    case 'failed':
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    default:
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
  }
};

const CreatedSMSCampaignForm = (props: WithRouterProps) => {
  const { campaignId } = props.params;
  const campaign = useTextingCampaign(campaignId);

  const [inputPhoneNumbers, setInputPhoneNumbers] = useState<string | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

  const handleInputPhoneNumbersChange = (value: string) => {
    setInputPhoneNumbers(value);
  };

  const handleInputMessageChange = (value: string) => {
    setInputMessage(value);
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNilOrError(inputPhoneNumbers) || isNilOrError(inputMessage)) return;

    const splitNumbers = inputPhoneNumbers.split(',');
    try {
      const result = await updateTextingCampaign(campaignId, {
        message: inputMessage,
        phone_numbers: splitNumbers,
      });
      const { id } = result.data;
      const url = `/admin/messaging/texting/${id}/preview`;
      clHistory.replace(url);
    } catch (error) {
      // handle error here in subsequent ticket
    }
  };

  useEffect(() => {
    if (!isNilOrError(campaign)) {
      setInputMessage(campaign.attributes.message);
      setInputPhoneNumbers(campaign.attributes.phone_numbers.join(', '));
    }
  }, [campaign]);

  useEffect(() => {
    if (isNilOrError(inputMessage)) return;
    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.attributes;
  const isDraft = status === 'draft';
  const overCharacterLimit = remainingChars < 0;

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'View SMS campaign' }}
        description={{
          id: 'test',
          defaultMessage: 'View SMS campaign description',
        }}
      />
      <TextingHeader
        headerMessage={getTitleMessage(status)}
        onClickGoBack={clHistory.goBack}
      />
      <>
        <Box display="inline-block" marginRight="12px" marginBottom="24px">
          <FormattedStatusLabel campaignStatus={status} />
        </Box>
        <span>{getAdditionalInfoByStatus(campaign)}</span>
      </>
      <StyledForm onSubmit={handleOnSubmit}>
        <Box marginBottom="20px">
          <Label>
            {isDraft && (
              <span>
                Enter a list of phone numbers. Separate each number by a comma
                and include the international dialing code (eg. +1).
              </span>
            )}
            {!isDraft && <span>Sent to:</span>}
          </Label>
          <TextArea
            rows={8}
            maxRows={8}
            value={inputPhoneNumbers}
            disabled={!isDraft}
            onChange={handleInputPhoneNumbersChange}
          />
        </Box>
        <Box marginBottom="30px">
          <Label>
            Message <IconTooltip content="Help goes here" />
          </Label>
          <TextArea
            rows={8}
            maxRows={8}
            value={inputMessage}
            disabled={!isDraft}
            onChange={handleInputMessageChange}
          />
          {isDraft && (
            <RemainingCharacters
              remainingChars={remainingChars}
              overCharacterLimit={overCharacterLimit}
            />
          )}
        </Box>

        {isDraft && (
          <Box display="flex" justifyContent="flex-start">
            <Button
              buttonStyle="primary"
              size="2"
              type="submit"
              text={'Update and Preview SMS'}
              onClick={handleOnSubmit}
            />
          </Box>
        )}
      </StyledForm>
    </>
  );
};

export default withRouter(CreatedSMSCampaignForm);
