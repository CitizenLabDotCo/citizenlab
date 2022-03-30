import React, { useState, useEffect } from 'react';
import { CLError } from 'typings';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import {
  Label,
  Box,
  IconTooltip,
  Error,
} from '@citizenlab/cl2-component-library';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import RemainingCharacters from '../components/RemainingCharacters';

// services
import { addTextingCampaign } from 'services/textingCampaigns';

// utils
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledForm = styled.form`
  width: 500px;
`;

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

const MAX_CHAR_COUNT = 320;

const NewSMSCampaign = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState<string | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);
  const [hasPhoneNumbers, setHasPhoneNumbers] = useState(false);
  const [hasInvalidPhoneNumbersError, setHasInvalidPhoneNumbersError] =
    useState(false);

  const handleInputPhoneNumbersChange = (value: string) => {
    setHasInvalidPhoneNumbersError(false);
    setInputPhoneNumbers(value);
    setHasPhoneNumbers(value.length > 0);
  };

  const handleInputMessageChange = (value: string) => {
    setInputMessage(value);
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNilOrError(inputMessage) || isNilOrError(inputPhoneNumbers)) return;

    const splitNumbers = inputPhoneNumbers.split(',');
    try {
      const result = await addTextingCampaign(inputMessage, splitNumbers);
      const { id } = result.data;
      const url = `/admin/messaging/texting/${id}/preview`;
      clHistory.replace(url);
    } catch (e) {
      const errors = e.json.errors.map((error: CLError) => error.error);

      if (errors.includes('invalid_phone_numbers')) {
        setHasInvalidPhoneNumbersError(true);
      }
    }
  };

  useEffect(() => {
    if (isNilOrError(inputMessage)) {
      setRemainingChars(MAX_CHAR_COUNT);
      return;
    }

    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  const overCharacterLimit = remainingChars < 0;
  const isSubmitButtonEnabled =
    !isNilOrError(inputMessage) &&
    !isNilOrError(inputPhoneNumbers) &&
    inputMessage.length > 0 &&
    inputPhoneNumbers.length > 0 &&
    !overCharacterLimit &&
    hasPhoneNumbers;

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <TextingHeader
        headerMessage="New SMS campaign"
        onClickGoBack={clHistory.goBack}
      />
      <StyledForm onSubmit={handleOnSubmit}>
        <Box marginBottom="20px">
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
          {hasInvalidPhoneNumbersError && (
            <Error text={formatMessage(messages.invalidPhoneNumbers)} />
          )}
        </Box>
        <Box marginBottom="30px">
          <Label>
            Message <IconTooltip content="Help goes here" />
          </Label>
          <TextArea
            rows={8}
            maxRows={8}
            value={inputMessage}
            onChange={handleInputMessageChange}
          />
          <RemainingCharacters
            remainingChars={remainingChars}
            overCharacterLimit={overCharacterLimit}
          />
        </Box>
        <Box display="flex" justifyContent="flex-start">
          <Button
            buttonStyle="primary"
            size="2"
            type="submit"
            text={'Preview SMS'}
            onClick={handleOnSubmit}
            disabled={!isSubmitButtonEnabled}
          />
        </Box>
      </StyledForm>
    </>
  );
};

export default injectIntl(NewSMSCampaign);
