import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import FormattedStatusLabel from '../components/FormattedStatusLabel';

// i18n
import { FormattedDate } from 'react-intl';

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
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    case 'sending':
      return (
        <>
          Sent at: <FormattedDate value={campaign.attributes.sent_at} />
        </>
      );
    case 'sent':
      return (
        <>
          Sent at: <FormattedDate value={campaign.attributes.sent_at} />
        </>
      );
    case 'failed':
      return (
        <>
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    default:
      return (
        <>
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
  }
};

const ViewCreatedMessage = (props: WithRouterProps) => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

  const { campaignId } = props.params;
  const campaign = useTextingCampaign(campaignId);

  const handleInputPhoneNumbersChange = (value) => {
    setInputPhoneNumbers(value);
  };

  const handleInputMessageChange = (value) => {
    setInputMessage(value);
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

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
    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.attributes;
  const isDraft = status === 'draft';

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'View SMS campaign' }}
        description={{
          id: 'test',
          defaultMessage: 'View SMS campaign description',
        }}
      />
      <Section>
        <SectionField>
          <TextingHeader
            headerMessage={getTitleMessage(status)}
            onClickGoBack={() => {
              clHistory.goBack();
            }}
          />
          <div>
            <Box display="inline-block" marginRight="12px">
              <FormattedStatusLabel campaignStatus={status} />
            </Box>
            <span>{getAdditionalInfoByStatus(campaign)}</span>
          </div>
        </SectionField>
        <StyledForm onSubmit={handleOnSubmit}>
          <SectionField>
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
          </SectionField>
          <SectionField>
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
            {isDraft && <>{remainingChars} characters remaining</>}
          </SectionField>

          {isDraft && (
            <SectionField>
              <Box maxWidth="250px">
                <Button
                  buttonStyle="primary"
                  size="2"
                  type="submit"
                  text={'Update and Preview SMS'}
                  onClick={handleOnSubmit}
                />
              </Box>
            </SectionField>
          )}
        </StyledForm>
      </Section>
    </>
  );
};

export default withRouter(ViewCreatedMessage);
