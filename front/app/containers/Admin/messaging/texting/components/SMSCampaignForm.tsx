import React, { useState, useEffect } from 'react';
import { CLError } from 'typings';

// components
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { Label, Box, Error } from '@citizenlab/cl2-component-library';
import RemainingCharacters from '../components/RemainingCharacters';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// services
import {
  updateTextingCampaign,
  addTextingCampaign,
  ITextingCampaignData,
} from 'services/textingCampaigns';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  className?: string;
  formIsLocked?: boolean;
  campaign?: ITextingCampaignData;
}

const MAX_CHAR_COUNT = 320;

const SMSCampaignForm = ({
  className,
  formIsLocked = false,
  campaign,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const campaignId = !isNilOrError(campaign) ? campaign.id : null;
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState<string | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);
  const [hasPhoneNumbers, setHasPhoneNumbers] = useState(false);
  const [hasInvalidPhoneNumbersError, setHasInvalidPhoneNumbersError] =
    useState(false);

  useEffect(() => {
    if (!isNilOrError(campaign)) {
      setInputMessage(campaign.attributes.message);
      setInputPhoneNumbers(campaign.attributes.phone_numbers.join(', '));
    }
  }, [campaign]);

  const handleInputPhoneNumbersChange = (value: string) => {
    setInputPhoneNumbers(value);
    setHasPhoneNumbers(value.length > 0);
  };

  const handleInputMessageChange = (value: string) => {
    setInputMessage(value);
    setRemainingChars(MAX_CHAR_COUNT - (inputMessage?.length || 0));
  };

  const handleOnSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNilOrError(inputMessage) || isNilOrError(inputPhoneNumbers)) return;

    const splitNumbers = inputPhoneNumbers.split(',');
    try {
      // if there's a campaignId and in this function,
      // we're in a draft campaign. Otherwise it's a new campaign.
      const result = campaignId
        ? await updateTextingCampaign(campaignId, {
            message: inputMessage,
            phone_numbers: splitNumbers,
          })
        : await addTextingCampaign(inputMessage, splitNumbers);
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

  const overCharacterLimit = remainingChars < 0;
  const isButtonDisabled = overCharacterLimit || !hasPhoneNumbers;
  // no campaign = creating new SMS, campaign = updating existing draft
  const buttonCopy = isNilOrError(campaignId)
    ? 'Preview SMS'
    : 'Update and preview SMS';

  return (
    <form className={className} onSubmit={handleOnSubmit}>
      <Box marginBottom="20px">
        <Label>
          {formIsLocked
            ? 'Sent to:'
            : 'Enter a list of phone numbers. Separate each number by a comma and include the international dialing code (eg. +1).'}
        </Label>
        <TextArea
          rows={8}
          maxRows={8}
          value={inputPhoneNumbers}
          disabled={formIsLocked}
          onChange={handleInputPhoneNumbersChange}
        />
        {hasInvalidPhoneNumbersError && (
          <Error text={formatMessage(messages.invalidPhoneNumbers)} />
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
        />
        {!formIsLocked && (
          <RemainingCharacters
            remainingChars={remainingChars}
            overCharacterLimit={overCharacterLimit}
          />
        )}
      </Box>

      {!formIsLocked && (
        <Box display="flex" justifyContent="flex-start">
          <Button
            buttonStyle="primary"
            size="2"
            type="submit"
            text={buttonCopy}
            onClick={handleOnSubmit}
            disabled={isButtonDisabled}
          />
        </Box>
      )}
    </form>
  );
};

export default injectIntl(SMSCampaignForm);
