import React from 'react';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ManualCampaignConsent = () => {
  const { formatMessage } = useIntl();

  return (
    <CheckboxWithLabel
      name="smsManualCampaignConsent"
      label={formatMessage(messages.smsManualCampaignConsentLabel2)}
    />
  );
};

export default ManualCampaignConsent;
