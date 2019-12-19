import React from 'react';
import GetCampaignConsents from 'resources/GetCampaignConsents';
import ConsentForm from 'components/ConsentForm';
import { isNilOrError } from 'utils/helperUtils';

export default () => (
  <GetCampaignConsents>
    {(consents) => !isNilOrError(consents) ? <ConsentForm consents={consents} /> : null}
  </GetCampaignConsents>
);
