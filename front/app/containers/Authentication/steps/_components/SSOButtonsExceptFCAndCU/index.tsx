import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IDKeycloakMethod } from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import { SignUpInFlow } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { FormattedMessage } from 'utils/cl-intl';

import AuthProviderButton, {
  Props as AuthProviderButtonProps,
  TOnContinueFunction,
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
  showConsent: boolean;
  flow: SignUpInFlow;
  onSelectAuthProvider: TOnContinueFunction;
}

// All our sso methods except FranceConnect and ClaveUnica
// because they have weird custom rules
const SSOButtonsExceptFCAndCU = ({
  showConsent,
  flow,
  onSelectAuthProvider,
}: Props) => {
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
          showConsent={showConsent}
          authProvider="fake_sso"
          onContinue={onSelectAuthProvider}
          id="e2e-login-with-fake-sso"
        >
          <FormattedMessage {...messages.continueWithFakeSSO} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.hoplr && (
        <WrappedAuthProviderButton
          icon="hoplr"
          showConsent={showConsent}
          authProvider="hoplr"
          onContinue={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithHoplr} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.nemlogIn && (
        <WrappedAuthProviderButton
          icon="mitid"
          showConsent={showConsent}
          authProvider="nemlog_in"
          onContinue={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithNemlogIn} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.idAustria && (
        <WrappedAuthProviderButton
          icon="idaustria"
          showConsent={showConsent}
          authProvider="id_austria"
          onContinue={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithIdAustria} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.criipto && (
        <WrappedAuthProviderButton
          icon="mitid"
          showConsent={showConsent}
          authProvider="criipto"
          onContinue={onSelectAuthProvider}
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
          showConsent={showConsent}
          authProvider="keycloak"
          onContinue={onSelectAuthProvider}
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
          showConsent={showConsent}
          authProvider="twoday"
          onContinue={onSelectAuthProvider}
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
          showConsent={showConsent}
          authProvider="acm"
          onContinue={onSelectAuthProvider}
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
        <ViennaSamlButton flow={flow} onContinue={onSelectAuthProvider} />
      )}
      {ssoProviders.google && (
        <WrappedAuthProviderButton
          showConsent={showConsent}
          icon="google"
          authProvider="google"
          onContinue={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithGoogle} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.facebook && (
        <WrappedAuthProviderButton
          icon="facebook"
          showConsent={showConsent}
          authProvider="facebook"
          onContinue={onSelectAuthProvider}
        >
          <FormattedMessage {...messages.continueWithFacebook} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.azureAd && (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          showConsent={showConsent}
          authProvider="azureactivedirectory"
          onContinue={onSelectAuthProvider}
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
          showConsent={showConsent}
          authProvider="azureactivedirectory_b2c"
          onContinue={onSelectAuthProvider}
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
