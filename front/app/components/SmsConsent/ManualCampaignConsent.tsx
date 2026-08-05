import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// Opt-in to non-transactional SMS. Expects a `smsManualCampaignConsent` boolean on the enclosing form.
const ManualCampaignConsent = () => {
  const { formatMessage } = useIntl();

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
