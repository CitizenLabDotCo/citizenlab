import React from 'react';
import GetCampaignConsents from 'resources/GetCampaignConsents';
import EmailCampaignsConsentForm from 'components/EmailCampaignsConsentForm';
import { isNilOrError } from 'utils/helperUtils';

export default () => (
  <GetCampaignConsents>
    {(consents) => !isNilOrError(consents) ? <EmailCampaignsConsentForm consents={consents} /> : null}
  </GetCampaignConsents>
);
