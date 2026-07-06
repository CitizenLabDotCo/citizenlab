import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IDKeycloakMethod, IdMethodName } from 'api/id_methods/types';
import useIdMethods from 'api/id_methods/useIdMethods';
import { getAzureB2cConfig, getAzureConfig } from 'api/id_methods/utils';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import { FormattedMessage } from 'utils/cl-intl';

import AuthProviderButton, {
  Props as AuthProviderButtonProps,
} from '../../_components/AuthProviderButton';
import ClaveUnicaExpandedAuthProviderButton from '../../_components/ClaveUnicaExpandedAuthProviderButton';
import sharedMessages from '../../_components/messages';
import ViennaSamlButton from '../../_components/ViennaSamlButton';
import useAuthMethodNames from '../methodNames';

import messages from './messages';

const WrappedAuthProviderButton = (props: AuthProviderButtonProps) => (
  <Box mb="18px">
    <AuthProviderButton {...props} />
  </Box>
);

interface Props {
  provider: IdMethodName;
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

/*
 * Renders the button for a single SSO provider. This is the single source of
 * truth for how each provider is presented (icon + label), so it can be reused
 * by any layout that needs to show a subset of providers.
 */
const SSOButton = ({ provider, onClickSSO }: Props) => {
  const { data: idMethods } = useIdMethods();
  const names = useAuthMethodNames();

  switch (provider) {
    case 'clave_unica':
      return (
        <Box mb="18px">
          <ClaveUnicaExpandedAuthProviderButton
            showConsent={true}
            onSelectAuthProvider={() => onClickSSO('clave_unica')}
          />
        </Box>
      );
    case 'fake_sso':
      return (
        <WrappedAuthProviderButton
          icon="bullseye"
          authProvider="fake_sso"
          onClick={onClickSSO}
          id="e2e-login-with-fake-sso"
        >
          <FormattedMessage {...messages.continueWithFakeSSO} />
        </WrappedAuthProviderButton>
      );
    case 'hoplr':
      return (
        <WrappedAuthProviderButton
          icon="hoplr"
          authProvider="hoplr"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithHoplr} />
        </WrappedAuthProviderButton>
      );
    case 'id_austria':
      return (
        <WrappedAuthProviderButton
          icon="idaustria"
          authProvider="id_austria"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithIdAustria} />
        </WrappedAuthProviderButton>
      );
    case 'criipto':
      return (
        <WrappedAuthProviderButton
          icon="mitid"
          authProvider="criipto"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
            values={{ loginMechanismName: names.criipto }}
          />
        </WrappedAuthProviderButton>
      );
    case 'keycloak': {
      const keycloakMethod = idMethods?.data.find(
        (item) => item.attributes.name === 'keycloak'
      ) as IDKeycloakMethod | undefined;
      const keycloakIcon = keycloakMethod?.attributes.provider;
      const keycloakName = names.keycloak;

      if (!keycloakIcon || !keycloakName) return null;

      return (
        <WrappedAuthProviderButton
          icon={keycloakIcon}
          authProvider="keycloak"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
            values={{ loginMechanismName: keycloakName }}
          />
        </WrappedAuthProviderButton>
      );
    }
    case 'twoday':
      return (
        <WrappedAuthProviderButton
          icon="bankId"
          authProvider="twoday"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
            values={{ loginMechanismName: names.twoday }}
          />
        </WrappedAuthProviderButton>
      );
    case 'acm':
      return (
        <WrappedAuthProviderButton
          icon="acm"
          authProvider="acm"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...sharedMessages.continueWithLoginMechanism}
            values={{ loginMechanismName: names.acm }}
          />
        </WrappedAuthProviderButton>
      );
    case 'federa':
      return (
        <WrappedAuthProviderButton
          icon="shield-check"
          authProvider="federa"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithFedera} />
        </WrappedAuthProviderButton>
      );
    case 'vienna_citizen':
      return <ViennaSamlButton onClick={onClickSSO} />;
    case 'google':
      return (
        <WrappedAuthProviderButton
          icon="google"
          authProvider="google"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithGoogle} />
        </WrappedAuthProviderButton>
      );
    case 'facebook':
      return (
        <WrappedAuthProviderButton
          icon="facebook"
          authProvider="facebook"
          onClick={onClickSSO}
        >
          <FormattedMessage {...messages.continueWithFacebook} />
        </WrappedAuthProviderButton>
      );
    case 'azureactivedirectory': {
      const azureConfig = getAzureConfig(idMethods);

      return (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          imageUrl={azureConfig?.attributes.logo_url}
          authProvider="azureactivedirectory"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...messages.continueWithAzure}
            values={{ azureProviderName: azureConfig?.attributes.login_mechanism_name }}
          />
        </WrappedAuthProviderButton>
      );
    }
    case 'azureactivedirectory_b2c': {
      const azureB2cConfig = getAzureB2cConfig(idMethods);

      return (
        <WrappedAuthProviderButton
          icon="microsoft-windows"
          imageUrl={azureB2cConfig?.attributes.logo_url}
          authProvider="azureactivedirectory_b2c"
          onClick={onClickSSO}
        >
          <FormattedMessage
            {...messages.continueWithAzure}
            values={{
              azureProviderName: azureB2cConfig?.attributes.login_mechanism_name,
            }}
          />
        </WrappedAuthProviderButton>
      );
    }
    case 'franceconnect':
      // FranceConnect is handled separately
      // (it has its own branded button), so not implemented here.
      return null;
    default:
      return null;
  }
};

export default SSOButton;
