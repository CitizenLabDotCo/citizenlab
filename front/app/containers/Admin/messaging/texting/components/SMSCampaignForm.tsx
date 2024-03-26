import React, { useState, useEffect } from 'react';

import { Label, Box, Error } from '@citizenlab/cl2-component-library';

import { ITextingCampaignData } from 'api/texting_campaigns/types';
import useAddTextingCampaign from 'api/texting_campaigns/useAddTextingCampaign';
import useUpdateTextingCampaign from 'api/texting_campaigns/useUpdateTextingCampaign';

import Button from 'components/UI/Button';
import TextArea from 'components/UI/TextArea';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import RemainingCharacters from '../components/RemainingCharacters';

interface Props {
  className?: string;
  formIsLocked?: boolean;
  campaign?: ITextingCampaignData;
}

type InvalidPhoneNumberError = {
  error: 'invalid';
  invalid_numbers: string[];
};
type PhoneNumberError = InvalidPhoneNumberError;

// For completeness:
//
// // This error should normally not be returned as we disable
// // the submit button if message is too long
// type TooLongMessageError = {
//   error: 'too_long';
//   // character count of message
//   count: number;
// };

// type MessageError = TooLongMessageError;

// type SMSCampaignError = PhoneNumberError | MessageError;

const MAX_CHAR_COUNT = 320;

const SMSCampaignForm = ({
  className,
  formIsLocked = false,
  campaign,
}: Props) => {
  const campaignId = !isNilOrError(campaign) ? campaign.id : null;
  const { mutateAsync: addTextingCampaign } = useAddTextingCampaign();
  const { mutateAsync: updateTextingCampaign } = useUpdateTextingCampaign();
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState<string | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);
  const [hasPhoneNumbers, setHasPhoneNumbers] = useState(false);
  const [hasInvalidPhoneNumbersError, setHasInvalidPhoneNumbersError] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isNilOrError(campaign)) {
      setInputMessage(campaign.attributes.message);
      setInputPhoneNumbers(campaign.attributes.phone_numbers.join(', '));
    }
  }, [campaign]);

  // update validation on loading a draft message
  useEffect(() => {
    setRemainingChars(MAX_CHAR_COUNT - (inputMessage?.length || 0));
  }, [inputMessage]);

  useEffect(() => {
    if (!isNilOrError(inputPhoneNumbers)) {
      setHasPhoneNumbers(inputPhoneNumbers.length > 0);
    }
  }, [inputPhoneNumbers]);

  const handleInputPhoneNumbersChange = (value: string) => {
    setHasInvalidPhoneNumbersError(false);
    setInputPhoneNumbers(value);
  };

  const handleInputMessageChange = (value: string) => {
    setInputMessage(value);
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNilOrError(inputMessage) || isNilOrError(inputPhoneNumbers)) return;

    const splitNumbers = inputPhoneNumbers.split(',');

    try {
      setIsLoading(true);
      // if there's a campaignId and in this function,
      // we're in a draft campaign. Otherwise it's a new campaign.
      const result = campaignId
        ? await updateTextingCampaign({
            id: campaignId,
            message: inputMessage,
            phone_numbers: splitNumbers,
          })
        : await addTextingCampaign({
            message: inputMessage,
            phone_numbers: splitNumbers,
          });
      const { id } = result.data;
      clHistory.replace(`/admin/messaging/texting/${id}/preview`);
    } catch (e) {
      setIsLoading(false);
      // This error is added to the response in back/engines/commercial/texting/app/models/texting/campaign.rb
      // Conditions are in back/engines/commercial/texting/app/services/texting/phone_number.rb
      const invalidPhoneNumberError: InvalidPhoneNumberError | undefined =
        e.errors.phone_numbers?.find(
          // at this stage there's only 1 possible phone number error (invalid)
          // so if the phone_numbers key is on e.errors, this line should
          // always find an InvalidPhoneNumberError. The undefined lies in not
          // finding the phone_numbers key on the e.errors object.
          (phoneNumberError: PhoneNumberError) =>
            phoneNumberError.error === 'invalid'
        );

      if (invalidPhoneNumberError) {
        setHasInvalidPhoneNumbersError(true);
      }
    }
  };

  // no campaign = creating new SMS, campaign = updating existing draft
  const buttonCopy = isNilOrError(campaignId)
    ? 'Preview SMS'
    : 'Update and preview SMS';
  const messageIsPastCharacterLimit = remainingChars < 0;
  const messageIsEmpty =
    isNilOrError(inputMessage) || inputMessage.length === 0;
  const hasPhoneNumbersError = !hasPhoneNumbers || hasInvalidPhoneNumbersError;
  const hasMessageError = messageIsPastCharacterLimit || messageIsEmpty;
  const isButtonDisabled = hasMessageError || hasPhoneNumbersError;

  return (
    <form className={className} onSubmit={handleOnSubmit}>
      <Box marginBottom="20px">
        <Label>
          {formIsLocked
            ? 'Sent to:'
            : 'Enter a list of phone numbers. Separate each number by a comma.'}
        </Label>
        <TextArea
          rows={8}
          maxRows={8}
          value={inputPhoneNumbers}
          disabled={formIsLocked}
          onChange={handleInputPhoneNumbersChange}
          id="e2e-sms-campaign-form-phone-numbers"
        />
        {hasInvalidPhoneNumbersError && (
          <Error text={'One or more of the phone numbers are invalid.'} />
        )}
      </Box>
      <Box marginBottom="30px">
        <Label>Message</Label>
        <TextArea
          rows={8}
          maxRows={8}
          value={inputMessage}
          disabled={formIsLocked}
          onChange={handleInputMessageChange}
          id="e2e-sms-campaign-form-message"
        />
        {!formIsLocked && (
          <RemainingCharacters
            remainingChars={remainingChars}
            overCharacterLimit={messageIsPastCharacterLimit}
          />
        )}
      </Box>

      {!formIsLocked && (
        <Box display="flex" justifyContent="flex-start">
          <Button
            buttonStyle="primary"
            size="m"
            type="submit"
            text={buttonCopy}
            onClick={handleOnSubmit}
            disabled={isButtonDisabled}
            processing={isLoading}
            id="e2e-sms-campaign-form-submit"
          />
        </Box>
      )}
    </form>
  );
};

export default SMSCampaignForm;
