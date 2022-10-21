import ConsentForm from 'components/ConsentForm';
import React from 'react';
import GetCampaignConsents from 'resources/GetCampaignConsents';
import { isNilOrError } from 'utils/helperUtils';
import tracks from './tracks';

export default () => (
  <GetCampaignConsents>
    {(consents) =>
      !isNilOrError(consents) ? (
        <ConsentForm
          trackEventName={
            tracks.clickChangeEmailNotificationProfileSettings.name
          }
          consents={consents}
        />
      ) : null
    }
  </GetCampaignConsents>
);
