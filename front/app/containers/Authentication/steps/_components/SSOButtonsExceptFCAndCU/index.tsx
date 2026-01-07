import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IDKeycloakMethod } from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import { AuthProvider } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { FormattedMessage } from 'utils/cl-intl';

import AuthProviderButton, {
  Props as AuthProviderButtonProps,
} from '../AuthProviderButton';
import parentMessages from '../messages';
import ViennaSamlButton from '../ViennaSamlButton';

import messages from './messages';

const WrappedAuthProviderButton = (props: AuthProviderButtonProps) => (
  <Box mb="18px">
    <AuthProviderButton {...props} />
  </Box>
);

interface Props {
  onSelectAuthProvider: (authProvider: AuthProvider) => void;
}

// All our sso methods except FranceConnect and ClaveUnica
// because they have weird custom rules
const SSOButtonsExceptFCAndCU = ({ onSelectAuthProvider }: Props) => {
  const { ssoProviders } = useAuthConfig();
  const { data: tenant } = useAppConfiguration();
  const { data: verificationMethods } = useVerificationMethods();

  const tenantSettings = tenant?.data.attributes.settings;

  const azureProviderName =
    tenantSettings?.azure_ad_login?.login_mechanism_name;
  const azureB2cProviderName =
    tenantSettings?.azure_ad_b2c_login?.login_mechanism_name;

  const keycloakMethod = verificationMethods?.data.find(
    (item) => item.attributes.name === 'keycloak'
  ) as IDKeycloakMethod | undefined;
  const keycloakIcon = keycloakMethod?.attributes.provider;
  const keycloakName = keycloakMethod?.attributes.method_metadata?.name;

  return (
    <>
      {ssoProviders.fakeSso && (
        <WrappedAuthProviderButton
          icon="bullseye"
          authProvider="fake_sso"
          onClick={onSelectAuthProvider}
          id="e2e-login-with-fake-sso"
        >
          <FormattedMessage {...messages.continueWithFakeSSO} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.hoplr && (
        <WrappedAuthProviderButton
          icon="hoplr"
          authProvider="hoplr"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithHoplr} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.nemlogIn && (
        <WrappedAuthProviderButton
          icon="mitid"
          authProvider="nemlog_in"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithNemlogIn} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.idAustria && (
        <WrappedAuthProviderButton
          icon="idaustria"
          authProvider="id_austria"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithIdAustria} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.criipto && (
        <WrappedAuthProviderButton
          icon="mitid"
          authProvider="criipto"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...parentMessages.continueWithLoginMechanism}
            values={{
              loginMechanismName:
                process.env.NODE_ENV === 'development'
                  ? 'MitID (Criipto)'
                  : 'MitID',
            }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.keycloak && keycloakIcon && keycloakName && (
        <WrappedAuthProviderButton
          icon={keycloakIcon}
          authProvider="keycloak"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...parentMessages.continueWithLoginMechanism}
            values={{
              loginMechanismName: keycloakName,
            }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.twoday && (
        <WrappedAuthProviderButton
          icon="bankId"
          authProvider="twoday"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...parentMessages.continueWithLoginMechanism}
            values={{
              loginMechanismName: 'BankID eller Freja eID+',
            }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.acm && (
        <WrappedAuthProviderButton
          icon="acm"
          authProvider="acm"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...parentMessages.continueWithLoginMechanism}
            values={{
              loginMechanismName: 'Itsme®',
            }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.viennaCitizen && (
        <ViennaSamlButton onClick={onSelectAuthProvider} />
      )}
      {ssoProviders.google && (
        <WrappedAuthProviderButton
          icon="google"
          authProvider="google"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithGoogle} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.facebook && (
        <WrappedAuthProviderButton
          icon="facebook"
          authProvider="facebook"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithFacebook} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.azureAd && (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          authProvider="azureactivedirectory"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...messages.continueWithAzure}
            values={{ azureProviderName }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.azureAdB2c && (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          authProvider="azureactivedirectory_b2c"
          onClick={onSelectAuthProvider}
        >
          <FormattedMessage
            {...messages.continueWithAzure}
            values={{ azureProviderName: azureB2cProviderName }}
          />
        </WrappedAuthProviderButton>
      )}
    </>
  );
};

export default SSOButtonsExceptFCAndCU;
