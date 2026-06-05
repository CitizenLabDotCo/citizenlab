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
  const { data: idMethods } = useVerificationMethods();

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

  const ssoProviders = (idMethods?.data || []).reduce((providers, method) => {
    const { authentication_method, name } = method.attributes;
    const enabled = authentication_method || providerForTest === name;

    return {
      ...providers,
      [name]: enabled,
    };
  }, {} as Record<TVerificationMethodName, boolean>);

  const azureAdMethod = idMethods?.data.find(
    (method): method is IDAzureAdMethod =>
      method.attributes.name === 'azureactivedirectory' &&
      method.attributes.authentication_method
  );
  const azureAdSettings = azureAdMethod?.attributes;
  const azureAdVisiblity = azureAdSettings?.visibility;
  const azureAdIsVisible = ['show', undefined].includes(azureAdVisiblity);
  const azureAdOverride = !!azureAdMethod && (azureAdIsVisible || showAdminOnlyMethods);

  const azureAdB2cMethod = idMethods?.data.find(
    (method): method is IDAzureAdB2cMethod =>
      method.attributes.name === 'azureactivedirectory_b2c' &&
      method.attributes.authentication_method
  );
  const azureAdB2cSettings = azureAdB2cMethod?.attributes;

  ssoProviders.azureactivedirectory = azureAdOverride;

  return {
    passwordLoginEnabled,
    ssoProviders,
    azureAdSettings,
    azureAdB2cSettings,
  };
}
