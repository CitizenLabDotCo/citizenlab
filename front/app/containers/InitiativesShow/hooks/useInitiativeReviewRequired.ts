import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

export default function useInitiativeReviewRequired() {
  const initiativeReviewEnabled = useFeatureFlag({
    name: 'initiative_review',
  });
  const { data: appConfig } = useAppConfiguration();
  const reviewRequired =
    appConfig?.data.attributes.settings.initiatives?.require_review;

  if (initiativeReviewEnabled) {
    return typeof reviewRequired === 'boolean'
      ? initiativeReviewEnabled && reviewRequired
      : false;
  } else {
    return false;
  }
}
