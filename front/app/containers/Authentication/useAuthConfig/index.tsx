import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { TVerificationMethodName } from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { useLocation, useSearch } from 'utils/router';

export default function useAuthConfig() {
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationSettings = appConfiguration?.data.attributes.settings;

  // Custom SSO methods are configured as verification methods, and the `/verification_methods` endpoint
  // exposes a `login_method` flag for the ones that can be used to authenticate.
  const { data: verificationMethods } = useVerificationMethods();
  const hasLoginMethod = (name: TVerificationMethodName) =>
    !!verificationMethods?.data.some(
      (method) =>
        method.attributes.name === name && method.attributes.login_method
    );

  // Allows testing of specific SSO providers without showing to all users
  // e.g. ?provider=keycloak
  const searchParams = useSearch({ strict: false });
  const providerForTest = searchParams.provider;

  // Allows super admins to sign in with password when password login is disabled
  // through hidden param (?super_admin) or cookie
  const isSuperAdmin = useSuperAdmin();

  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');

  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;

  // Google, Facebook and Azure AD are not custom ID / verification methods  have their own feature flags.
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

  const ssoProviders = {
    google,
    facebook,
    azureAd,
    azureAdB2c,
    franceconnect: hasLoginMethod('franceconnect'),
    viennaCitizen: hasLoginMethod('vienna_citizen'),
    claveUnica: hasLoginMethod('clave_unica'),
    hoplr: hasLoginMethod('hoplr'),
    idAustria: hasLoginMethod('id_austria'),
    criipto: hasLoginMethod('criipto'),
    // NOTE: Quick fix - required a better solution
    // NemLog-in is intentionally hidden from the login-method list.
    // It remains a functional auth method: the backend still reports
    // `login_method: true` and the /auth/nemlog_in route and the verification
    // flow keep working — it's just not shown as a self-serve login button.
    nemlogIn: false,
    keycloak: hasLoginMethod('keycloak') || providerForTest === 'keycloak',
    twoday: hasLoginMethod('twoday') || providerForTest === 'twoday',
    acm: hasLoginMethod('acm') || providerForTest === 'acm',
    federa: hasLoginMethod('federa'),
    fakeSso: hasLoginMethod('fake_sso'),
  };

  return {
    passwordLoginEnabled,
    ssoProviders,
    azureAdSettings,
  };
}
