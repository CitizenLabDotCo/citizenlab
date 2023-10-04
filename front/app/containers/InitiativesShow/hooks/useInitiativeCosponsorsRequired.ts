import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from '../../../hooks/useFeatureFlag';

export default function useInitiativeCosponsorsRequired() {
  const initiativeCosponsorsEnabled = useFeatureFlag({
    name: 'initiative_cosponsors',
  });
  const { data: appConfig } = useAppConfiguration();

  const cosponsorsRequired =
    appConfig?.data.attributes.settings.initiatives.require_cosponsors;

  if (typeof cosponsorsRequired === 'boolean') {
    return initiativeCosponsorsEnabled && cosponsorsRequired;
  }

  // setting doesn't exist (is not configured, so we don't require cosponsors)
  return false;
}
