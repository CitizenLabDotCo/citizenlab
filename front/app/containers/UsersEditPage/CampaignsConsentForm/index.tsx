import React from 'react';
import tracks from './tracks';
import { isNilOrError } from 'utils/helperUtils';
import ConsentForm from 'components/ConsentForm';
import GetCampaignConsents from 'resources/GetCampaignConsents';

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
