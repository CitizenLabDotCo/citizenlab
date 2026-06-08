import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Success,
} from '@citizenlab/cl2-component-library';

import { ISmsConsentData, ISmsConsentChange } from 'api/sms_consents/types';
import useSmsConsents from 'api/sms_consents/useSmsConsents';
import useUpdateSmsConsents from 'api/sms_consents/useUpdateSmsConsents';

import useLocalize from 'hooks/useLocalize';

import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface LocalConsent {
  consented: boolean;
  label: string;
}

const SmsConsentForm = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: original } = useSmsConsents();
  const { mutate: updateSmsConsents, isLoading } = useUpdateSmsConsents();

  const [consents, setConsents] = useState<Record<string, LocalConsent> | null>(
    null
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isNilOrError(original)) {
      setConsents(
        Object.fromEntries(
          original.data.map((consent): [string, LocalConsent] => [
            consent.id,
            {
              consented: consent.attributes.consented,
              label: localize(
                consent.attributes.campaign_type_description_multiloc
              ),
            },
          ])
        )
      );
    }
  }, [original, localize]);

  if (isNilOrError(original) || original.data.length === 0 || !consents) {
    return null;
  }

  const onChange = (id: string) => () => {
    setSaved(false);
    setConsents({
      ...consents,
      [id]: { ...consents[id], consented: !consents[id].consented },
    });
  };

  const onSubmit = () => {
    const consentChanges: ISmsConsentChange[] = original.data
      .filter(
        (consent: ISmsConsentData) =>
          consent.attributes.consented !== consents[consent.id].consented
      )
      .map((consent: ISmsConsentData) => ({
        smsConsentId: consent.id,
        consented: consents[consent.id].consented,
      }));

    if (consentChanges.length === 0) return;

    updateSmsConsents({ consentChanges }, { onSuccess: () => setSaved(true) });
  };

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.smsConsentTitle}
        subtitleMessage={messages.smsConsentSubtitle}
      />
      {saved && (
        <Box mb="16px">
          <Success text={formatMessage(messages.smsConsentSaved)} />
        </Box>
      )}
      {original.data.map((consent) => (
        <CheckboxWithLabel
          key={consent.id}
          size="20px"
          mb="12px"
          checked={consents[consent.id].consented}
          onChange={onChange(consent.id)}
          label={consents[consent.id].label}
        />
      ))}
      <Box mt="20px" display="flex">
        <Button processing={isLoading} onClick={onSubmit}>
          {formatMessage(messages.smsConsentSave)}
        </Button>
      </Box>
    </FormSection>
  );
};

export default SmsConsentForm;
