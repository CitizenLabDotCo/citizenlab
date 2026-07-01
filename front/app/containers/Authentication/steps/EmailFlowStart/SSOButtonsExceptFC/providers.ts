import { IdMethodName } from 'api/id_methods/types';
import useIdMethods from 'api/id_methods/useIdMethods';

import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { SSOButtonProvider } from './SSOButton';

// The order in which SSO providers (except FranceConnect) are rendered.
const SSO_PROVIDERS_EXCEPT_FC: SSOButtonProvider[] = [
  'clave_unica',
  'fake_sso',
  'hoplr',
  'id_austria',
  'criipto',
  'keycloak',
  'twoday',
  'acm',
  'federa',
  'vienna_citizen',
  'google',
  'facebook',
  'azureactivedirectory',
  'azureactivedirectory_b2c',
];

interface SplitSSOProviders {
  // All enabled providers (FranceConnect excluded), in display order.
  allProviders: SSOButtonProvider[];
  // Enabled providers that can be used to verify (authentication + verification).
  verificationProviders: SSOButtonProvider[];
  // Enabled providers that can only authenticate, not verify.
  nonVerificationProviders: SSOButtonProvider[];
  // Whether at least one authentication + verification method is active
  // (including FranceConnect, which is always shown as a verification method).
  hasVerificationMethod: boolean;
}

/*
 * Returns the enabled SSO providers (FranceConnect excluded), split by whether
 * they can be used for verification. A provider "supports verification" when
 * its id method has verification_method === true. Verification-only methods
 * (authentication_method === false) are never enabled here, as useAuthConfig
 * only exposes providers that can authenticate.
 */
const useSSOProviders = (): SplitSSOProviders => {
  const { ssoProviders } = useAuthConfig();
  const { data: idMethods } = useIdMethods();

  const supportsVerification = (name: IdMethodName) =>
    !!idMethods?.data.find((method) => method.attributes.name === name)
      ?.attributes.verification_method;

  const allProviders = SSO_PROVIDERS_EXCEPT_FC.filter(
    (provider) => ssoProviders[provider]
  );
  const verificationProviders = allProviders.filter(supportsVerification);

  const franceConnectIsVerificationMethod =
    !!ssoProviders.franceconnect && supportsVerification('franceconnect');

  return {
    allProviders,
    verificationProviders,
    nonVerificationProviders: allProviders.filter(
      (provider) => !supportsVerification(provider)
    ),
    hasVerificationMethod:
      verificationProviders.length > 0 || franceConnectIsVerificationMethod,
  };
};

export default useSSOProviders;
