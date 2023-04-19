import useFeatureFlag from 'hooks/useFeatureFlag';

export default function useAnySSOEnabled() {
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const viennaCitizenLoginEnabled = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const anySSOEnabled =
    googleLoginEnabled ||
    facebookLoginEnabled ||
    azureAdLoginEnabled ||
    franceconnectLoginEnabled ||
    viennaCitizenLoginEnabled;

  return anySSOEnabled;
}
