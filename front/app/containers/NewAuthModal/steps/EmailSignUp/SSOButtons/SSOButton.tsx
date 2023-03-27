import React from 'react';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AuthProviderButton from 'components/AuthProviders/AuthProviderButton';

// i18n
import { useIntl } from 'utils/cl-intl';
import oldMessages from 'components/AuthProviders/messages';

// typings
import { SSOProviderWithoutVienna } from 'containers/NewAuthModal/typings';

interface Props {
  ssoProvider: SSOProviderWithoutVienna;
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const ICON_MAP = {
  facebook: 'facebook',
  google: 'google',
  azureactivedirectory: 'microsoft-windows',
} as const;

const MESSAGE_MAP = {
  facebook: oldMessages.continueWithFacebook,
  google: oldMessages.continueWithGoogle,
} as const;

const SSOButton = ({ ssoProvider, onClickSSO }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  // const handleClickFranceConnect = () => onClickSSO('franceconnect');

  if (ssoProvider === 'franceconnect') {
    return <Box mt="12px">{/* TODO */}</Box>;
  }

  const azureProviderName =
    appConfiguration.data.attributes.settings.azure_ad_login
      ?.login_mechanism_name ?? 'Azure Active Directory';

  return (
    <Box mt="12px">
      <AuthProviderButton
        flow="signup"
        icon={ICON_MAP[ssoProvider]}
        authProvider={ssoProvider}
        onContinue={onClickSSO}
      >
        {ssoProvider === 'azureactivedirectory'
          ? formatMessage(oldMessages.continueWithAzure, { azureProviderName })
          : formatMessage(MESSAGE_MAP[ssoProvider])}
      </AuthProviderButton>
    </Box>
  );
};

export default SSOButton;
