import React from 'react';
import franceConnectImage from './franceconnect.png';

// components
import { Box, Icon, Image } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// i18n
import oldMessages from 'components/AuthProviders/messages';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  ssoProvider: 'google' | 'facebook' | 'franceconnect' | 'azureAd';
}

const ICON_NAME_MAP = {
  google: 'google',
  facebook: 'facebook',
  azureAd: 'microsoft-windows',
} as const;

const SSOButton = ({ ssoProvider }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  const getText = () => {
    if (ssoProvider === 'google')
      return formatMessage(oldMessages.continueWithGoogle);
    if (ssoProvider === 'facebook')
      return formatMessage(oldMessages.continueWithFacebook);

    if (ssoProvider === 'azureAd') {
      const azureProviderName =
        appConfiguration?.data.attributes.settings.azure_ad_login
          ?.login_mechanism_name ?? 'Azure Active Directory';
      return formatMessage(oldMessages.continueWithAzure, {
        azureProviderName,
      });
    }

    return formatMessage(messages.continueWithFranceConnect);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      mt="12px"
    >
      {ssoProvider === 'google' ||
      ssoProvider === 'facebook' ||
      ssoProvider === 'azureAd' ? (
        <Icon
          name={ICON_NAME_MAP[ssoProvider]}
          width="18px"
          height="18px"
          mr="4px"
        />
      ) : (
        <Image src={franceConnectImage} alt="" width="18px" mr="4px" />
      )}
      <button>{getText()}</button>
    </Box>
  );
};

export default SSOButton;
