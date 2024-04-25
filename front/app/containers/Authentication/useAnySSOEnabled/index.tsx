import useFeatureFlag from 'hooks/useFeatureFlag';

export default function useAnySSOEnabled() {
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const azureAdB2cLoginEnabled = useFeatureFlag({ name: 'azure_ad_b2c_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const viennaCitizenLoginEnabled = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const claveUnicaLoginEnabled = useFeatureFlag({
    name: 'clave_unica_login',
  });

  const hoplrLoginEnabled = useFeatureFlag({
    name: 'hoplr_login',
  });

  const criiptoLoginEnabled = useFeatureFlag({
    name: 'criipto_login',
  });

  const anySSOEnabled =
    googleLoginEnabled ||
    facebookLoginEnabled ||
    azureAdLoginEnabled ||
    azureAdB2cLoginEnabled ||
    franceconnectLoginEnabled ||
    viennaCitizenLoginEnabled ||
    claveUnicaLoginEnabled ||
    hoplrLoginEnabled ||
    criiptoLoginEnabled;

  return anySSOEnabled;
}
