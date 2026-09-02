import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ManualCampaignConsent = () => {
  const { formatMessage } = useIntl();
  // The sms feature carries the Twilio settings manual campaigns send through.
  const smsFFEnabled = useFeatureFlag({ name: 'sms' });
  const smsManualCampaignsFFEnabled = useFeatureFlag({
    name: 'sms_manual_campaigns',
  });

  if (!smsFFEnabled || !smsManualCampaignsFFEnabled) return null;

  return (
    <CheckboxWithLabel
      name="smsManualCampaignConsent"
      label={formatMessage(messages.smsManualCampaignConsentLabel2)}
    />
  );
};

export default ManualCampaignConsent;
