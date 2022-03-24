import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';

// utils
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';

// hooks
import useTextingCampaign from 'hooks/useTextingCampaign';

// services
import {
  updateTextingCampaign,
  ITextingCampaignStatuses,
} from 'services/textingCampaigns';

// styling
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledForm = styled.form`
  width: 500px;
`;

// enough to fit 3 messages, actual functionality TBD in subsequent ticket
// const MAX_CHAR_COUNT = 480;

const ViewCreatedMessage = (props: WithRouterProps) => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  // const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

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
      console.log('something broke', error);
    }
  };

  useEffect(() => {
    if (!isNilOrError(campaign)) {
      setInputMessage(campaign.attributes.message);
      setInputPhoneNumbers(campaign.attributes.phone_numbers.join(', '));
    }
  }, [campaign]);

  const getTitleMessage = (campaignStatus: ITextingCampaignStatuses) => {
    switch (campaignStatus) {
      case 'draft':
        return 'Draft SMS Campaign';
      case 'sending':
        return 'Sending SMS Campaign';
      case 'sent':
        return 'Sent SMS Campaign';
      default:
        return 'Created SMS Campaign';
    }
  };

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.attributes;

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
        </SectionField>
        <StyledForm onSubmit={handleOnSubmit}>
          <SectionField>
            <Label>
              Enter a list of phone numbers. Separate each number by a comma and
              include the international dialing code (eg. +1).
            </Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputPhoneNumbers}
              disabled={status !== 'draft'}
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
              disabled={status !== 'draft'}
              onChange={handleInputMessageChange}
            />
            {/* {remainingChars} characters remaining */}
          </SectionField>

          {status === 'draft' && (
            <SectionField>
              <Box maxWidth="250px">
                <Button
                  buttonStyle="primary"
                  size="2"
                  type="submit"
                  text={'Preview SMS'}
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
