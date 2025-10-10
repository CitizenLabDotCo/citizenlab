import { useLocation, useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { TVerificationMethodName } from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';

export default function useAuthConfig() {
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationSettings = appConfiguration?.data.attributes.settings;

  const { data: verificationMethods } = useVerificationMethods(
    appConfigurationSettings?.verification?.enabled || false
  );

  // Allows testing of custom SSO providers without showing to all users
  // e.g. ?provider=keycloak
  const [searchParams] = useSearchParams();
  const providerForTest = searchParams.get('provider');

  // Allows super admins to sign in with password when password login is disabled
  // through hidden param (?super_admin)
  const superAdminParam = searchParams.get('super_admin') !== null;

  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');

  // Standard auth methods
  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || superAdminParam;

  const google = useFeatureFlag({ name: 'google_login' });

  const facebook = useFeatureFlag({ name: 'facebook_login' });

  const azureAd =
    useFeatureFlag({ name: 'azure_ad_login' }) &&
    ((appConfigurationSettings?.azure_ad_login?.visibility !== 'link' &&
      appConfigurationSettings?.azure_ad_login?.visibility !== 'hide') ||
      showAdminOnlyMethods);

  const azureAdB2c = useFeatureFlag({
    name: 'azure_ad_b2c_login',
  });

  // Custom SSO methods - found in the verification config
  const isCustomSsoEnabled = (methodName: TVerificationMethodName) => {
    return (
      verificationMethods?.data.some(
        (method) => method.attributes.name === methodName
      ) || providerForTest === methodName
    );
  };

  const fakeSso = isCustomSsoEnabled('fake_sso');
  const keycloak = isCustomSsoEnabled('keycloak');
  const twoday = isCustomSsoEnabled('twoday');
  const idAustria = isCustomSsoEnabled('id_austria');
  const criipto = isCustomSsoEnabled('criipto');
  const claveUnica = isCustomSsoEnabled('clave_unica');
  const franceconnect = isCustomSsoEnabled('franceconnect');

  // TODO: JS - these need converting
  const viennaCitizen = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const hoplr = useFeatureFlag({
    name: 'hoplr_login',
  });

  const nemlogIn = useFeatureFlag({
    name: 'nemlog_in_login',
  });

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
    fakeSso,
  };

  return {
    passwordLoginEnabled,
    ssoProviders,
    anySSOProviderEnabled: Object.values(ssoProviders).some((v) => v),
  };
}
