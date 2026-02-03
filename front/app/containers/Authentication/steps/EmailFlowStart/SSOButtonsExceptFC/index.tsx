import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IDKeycloakMethod } from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { FormattedMessage } from 'utils/cl-intl';

import AuthProviderButton, {
  Props as AuthProviderButtonProps,
} from '../../_components/AuthProviderButton';
import ClaveUnicaExpandedAuthProviderButton from '../../_components/ClaveUnicaExpandedAuthProviderButton';
import sharedMessages from '../../_components/messages';
import ViennaSamlButton from '../../_components/ViennaSamlButton';

import messages from './messages';

const WrappedAuthProviderButton = (props: AuthProviderButtonProps) => (
  <Box mb="18px">
    <AuthProviderButton {...props} />
  </Box>
);

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
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
      {ssoProviders.claveUnica && (
        <Box mb="18px">
          <ClaveUnicaExpandedAuthProviderButton
            showConsent={true}
            onSelectAuthProvider={() => onClickSSO('clave_unica')}
          />
        </Box>
      )}
      {ssoProviders.fakeSso && (
        <WrappedAuthProviderButton
          icon="bullseye"
          authProvider="fake_sso"
          onClick={onClickSSO}
          id="e2e-login-with-fake-sso"
        >
          <FormattedMessage {...messages.continueWithFakeSSO} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.hoplr && (
        <WrappedAuthProviderButton
          icon="hoplr"
          authProvider="hoplr"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithHoplr} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.nemlogIn && (
        <WrappedAuthProviderButton
          icon="mitid"
          authProvider="nemlog_in"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithNemlogIn} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.idAustria && (
        <WrappedAuthProviderButton
          icon="idaustria"
          authProvider="id_austria"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithIdAustria} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.criipto && (
        <WrappedAuthProviderButton
          icon="mitid"
          authProvider="criipto"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
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
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
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
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
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
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
            values={{
              loginMechanismName: 'Itsme®',
            }}
          />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.viennaCitizen && <ViennaSamlButton onClick={onClickSSO} />}
      {ssoProviders.google && (
        <WrappedAuthProviderButton
          icon="google"
          authProvider="google"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithGoogle} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.facebook && (
        <WrappedAuthProviderButton
          icon="facebook"
          authProvider="facebook"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithFacebook} />
        </WrappedAuthProviderButton>
      )}
      {ssoProviders.azureAd && (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          authProvider="azureactivedirectory"
          onClick={onClickSSO}
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
          onClick={onClickSSO}
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

export default SSOButtonsExceptFC;
