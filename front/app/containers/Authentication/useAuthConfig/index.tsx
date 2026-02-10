import { useLocation, useSearch } from 'utils/router';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

export default function useAuthConfig() {
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationSettings = appConfiguration?.data.attributes.settings;

  // Allows testing of specific SSO providers without showing to all users
  // e.g. ?provider=keycloak
  const [searchParams] = useSearch({ strict: false });
  const providerForTest = searchParams.get('provider');

  // Allows super admins to sign in with password when password login is disabled
  // through hidden param (?super_admin) or cookie
  const isSuperAdmin = useSuperAdmin();

  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');

  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;

  const google = useFeatureFlag({ name: 'google_login' });

  const facebook = useFeatureFlag({ name: 'facebook_login' });

  const azureAdSettings = appConfigurationSettings?.azure_ad_login;
  const azureAdVisiblity = azureAdSettings?.visibility;
  const azureAdIsVisible = ['show', undefined].includes(azureAdVisiblity);

  const azureAd =
    useFeatureFlag({ name: 'azure_ad_login' }) &&
    (azureAdIsVisible || showAdminOnlyMethods);

  const azureAdB2c = useFeatureFlag({
    name: 'azure_ad_b2c_login',
  });

  const franceconnect = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const viennaCitizen = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const claveUnica = useFeatureFlag({
    name: 'clave_unica_login',
  });

  const hoplr = useFeatureFlag({
    name: 'hoplr_login',
  });

  const idAustria = useFeatureFlag({
    name: 'id_austria_login',
  });

  const criipto = useFeatureFlag({
    name: 'criipto_login',
  });

  const nemlogIn = useFeatureFlag({
    name: 'nemlog_in_login',
  });

  const keycloak =
    useFeatureFlag({
      name: 'keycloak_login',
    }) || providerForTest === 'keycloak';

  const twoday =
    useFeatureFlag({
      name: 'twoday_login',
    }) || providerForTest === 'twoday';

  const acm =
    useFeatureFlag({
      name: 'acm_login',
    }) || providerForTest === 'acm';

  const fakeSso = useFeatureFlag({ name: 'fake_sso' });

  const ssoProviders = {
    google,
    facebook,
    azureAd,
    azureAdB2c,
    franceconnect,
    viennaCitizen,
    claveUnica,
    hoplr,
    idAustria,
    criipto,
    nemlogIn,
    keycloak,
    twoday,
    acm,
    fakeSso,
  };

  return {
    passwordLoginEnabled,
    ssoProviders,
    azureAdSettings,
  };
}
