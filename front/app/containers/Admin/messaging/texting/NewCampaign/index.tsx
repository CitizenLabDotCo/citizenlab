import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../TextingHeader';

// services
import { addTextingCampaign } from 'services/textingCampaigns';

// utils
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';

const StyledForm = styled.form`
  width: 500px;
`;

// enough to fit 3 messages
const MAX_CHAR_COUNT = 480;

const TextCreation = () => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

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
      const result = await addTextingCampaign(inputMessage, splitNumbers);
      const { id } = result.data;
      const url = `/admin/messaging/texting/${id}`;
      clHistory.replace(url);
    } catch (error) {
      console.log('something borked', error);
    }
  };

  useEffect(() => {
    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <Section>
        <SectionField>
          <TextingHeader
            headerMessage="New SMS campaign"
            onClickGoBack={() => {}}
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
              onChange={handleInputMessageChange}
            />
            {remainingChars} characters remaining
          </SectionField>

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
        </StyledForm>
      </Section>
    </>
  );
};

export default TextCreation;
