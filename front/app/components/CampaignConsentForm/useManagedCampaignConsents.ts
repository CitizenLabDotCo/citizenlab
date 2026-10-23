import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import { internalCommentNotificationTypes } from 'api/campaigns/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

// The consents a user can manage in the consent form. Shared with the email settings page,
// which reads the same query to tell whether the user may manage their preferences at all.
const useManagedCampaignConsents = (unsubscriptionToken?: string | null) => {
  const isInternalCommentingEnabled = useFeatureFlag({
    name: 'internal_commenting',
  });

  return useCampaignConsents({
    unsubscriptionToken,
    withoutCampaignNames: [
      ...(isInternalCommentingEnabled ? [] : internalCommentNotificationTypes),
    ],
  });
};

export default useManagedCampaignConsents;
