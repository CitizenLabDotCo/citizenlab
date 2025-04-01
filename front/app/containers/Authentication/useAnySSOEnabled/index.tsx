import useFeatureFlag from 'hooks/useFeatureFlag';

export default function useAnySSOEnabled() {
  const fakeSSOEnabled = useFeatureFlag({ name: 'fake_sso' });
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

  const idAustriaLoginEnabled = useFeatureFlag({
    name: 'id_austria_login',
  });

  const criiptoLoginEnabled = useFeatureFlag({
    name: 'criipto_login',
  });

  const keycloakLoginEnabled = useFeatureFlag({
    name: 'keycloak_login',
  });

  const twodayLoginEnabled = useFeatureFlag({
    name: 'twoday_login',
  });

  const anySSOEnabled =
    fakeSSOEnabled ||
    googleLoginEnabled ||
    facebookLoginEnabled ||
    azureAdLoginEnabled ||
    azureAdB2cLoginEnabled ||
    franceconnectLoginEnabled ||
    viennaCitizenLoginEnabled ||
    claveUnicaLoginEnabled ||
    hoplrLoginEnabled ||
    criiptoLoginEnabled ||
    keycloakLoginEnabled ||
    twodayLoginEnabled ||
    idAustriaLoginEnabled;

  return anySSOEnabled;
}
