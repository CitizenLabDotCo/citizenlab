import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

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
    <Box mt="20px" mb="8px">
      <CheckboxWithLabel
        name="smsManualCampaignConsent"
        label={formatMessage(messages.smsManualCampaignConsentLabel)}
        dataTestId="sms-manual-campaign-consent"
      />
    </Box>
  );
};

export default ManualCampaignConsent;
