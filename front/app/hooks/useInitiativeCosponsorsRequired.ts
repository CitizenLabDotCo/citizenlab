import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from './useFeatureFlag';

export default function useInitiativeCosponsorsRequired() {
  const initiativeCosponsorsEnabled = useFeatureFlag({
    name: 'initiative_cosponsors',
  });
  const { data: appConfig } = useAppConfiguration();
  const reviewRequired =
    appConfig?.data.attributes.settings.initiatives?.require_cosponsors;

  return initiativeCosponsorsEnabled && reviewRequired;
}
