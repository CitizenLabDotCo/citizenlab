import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from './useFeatureFlag';

export default function useInitiativeReviewRequired() {
  const initiativeReviewEnabled = useFeatureFlag({
    name: 'initiative_review',
  });
  const { data: appConfig } = useAppConfiguration();
  const reviewRequired =
    appConfig?.data.attributes.settings.initiatives?.require_review;

  return initiativeReviewEnabled && reviewRequired;
}
