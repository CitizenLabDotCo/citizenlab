import {
  IDAzureAdMethod,
  IDAzureAdB2cMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { useLocation, useSearch } from 'utils/router';

export default function useAuthConfig() {
  // All SSO methods (including the built-in Facebook/Google/Azure ones) are
  // configured as verification methods, and the `/verification_methods` endpoint
  // exposes a `authentication_method` flag for the ones that can be used to authenticate.
  const { data: verificationMethods } = useVerificationMethods();
  const hasLoginMethod = (name: TVerificationMethodName) =>
    !!verificationMethods?.data.some(
      (method) =>
        method.attributes.name === name && method.attributes.authentication_method
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

  const google = hasLoginMethod('google');

  const facebook = hasLoginMethod('facebook');

  const azureAdMethod = verificationMethods?.data.find(
    (method): method is IDAzureAdMethod =>
      method.attributes.name === 'azureactivedirectory' &&
      method.attributes.authentication_method
  );
  const azureAdSettings = azureAdMethod?.attributes;
  const azureAdVisiblity = azureAdSettings?.visibility;
  const azureAdIsVisible = ['show', undefined].includes(azureAdVisiblity);

  const azureAd = !!azureAdMethod && (azureAdIsVisible || showAdminOnlyMethods);

  const azureAdB2cMethod = verificationMethods?.data.find(
    (method): method is IDAzureAdB2cMethod =>
      method.attributes.name === 'azureactivedirectory_b2c' &&
      method.attributes.authentication_method
  );
  const azureAdB2cSettings = azureAdB2cMethod?.attributes;
  const azureAdB2c = !!azureAdB2cMethod;

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
    nemlogIn: hasLoginMethod('nemlog_in'),
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
    azureAdB2cSettings,
  };
}
