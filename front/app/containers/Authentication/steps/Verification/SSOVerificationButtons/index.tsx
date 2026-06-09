import React from 'react';

import {
  TVerificationMethod,
  TVerificationMethodName,
  IDAuth0Method,
} from 'api/id_methods/types';

import SSOVerificationButton from 'containers/Authentication/steps/_components/SSOVerificationButton';

import Auth0VerificationButton from './Auth0VerificationButton';
import ClaveUnicaVerificationButton from './ClaveUnicaVerificationButton';
import FranceConnectVerificationButton from './FranceConnectVerificationButton';

// SSO verification methods rendered by this centralized component. The
// remaining (form-based, manual) methods are still rendered through the
// `app.components.VerificationModal.buttons` outlet by their own modules.
const CENTRALIZED_METHODS: TVerificationMethodName[] = [
  'acm',
  'auth0',
  'clave_unica',
  'criipto',
  'fake_sso',
  'federa',
  'franceconnect',
  'id_austria',
  'keycloak',
  'nemlog_in',
  'twoday',
];

export const isCentralizedSSOMethod = (method: TVerificationMethod) =>
  method.attributes.verification_method &&
  CENTRALIZED_METHODS.includes(method.attributes.name);

interface Props {
  verificationMethods: TVerificationMethod[];
  onClick: (method: TVerificationMethod) => void;
}

const SSOVerificationButtons = ({ verificationMethods, onClick }: Props) => {
  const methods = verificationMethods.filter(isCentralizedSSOMethod);

  return (
    <>
      {methods.map((method, index) => {
        const last = index === methods.length - 1;

        switch (method.attributes.name) {
          case 'franceconnect':
            return (
              <FranceConnectVerificationButton
                key={method.id}
                method={method}
                onClick={onClick}
              />
            );
          case 'clave_unica':
            return <ClaveUnicaVerificationButton key={method.id} />;
          case 'auth0':
            return (
              <Auth0VerificationButton
                key={method.id}
                verificationMethod={method as IDAuth0Method}
                last={last}
                onClick={onClick}
              />
            );
          default:
            return (
              <SSOVerificationButton
                key={method.id}
                verificationMethod={method}
                last={last}
                onClick={onClick}
              />
            );
        }
      })}
    </>
  );
};

export default SSOVerificationButtons;
