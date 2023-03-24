import React from 'react';
import franceConnectImage from './franceconnect.png';

// components
import { Box, Icon, Image } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import oldMessages from 'components/AuthProviders/messages';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { SSOProviderWithoutVienna } from '../../../typings';

interface Props {
  ssoProvider: SSOProviderWithoutVienna;
  disabled: boolean;
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const ICON_NAME_MAP = {
  google: 'google',
  facebook: 'facebook',
  azureAd: 'microsoft-windows',
} as const;

const Button = styled.button`
  color: ${colors.coolGrey600};
  &:hover {
    color: ${colors.grey800};
  }

  text-decoration: underline;
  cursor: pointer;
`;

const SSOButton = ({ ssoProvider, disabled, onClickSSO }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  const getText = () => {
    if (ssoProvider === 'google') {
      return formatMessage(oldMessages.continueWithGoogle);
    }

    if (ssoProvider === 'facebook') {
      return formatMessage(oldMessages.continueWithFacebook);
    }

    if (ssoProvider === 'azureactivedirectory') {
      const azureProviderName =
        appConfiguration?.data.attributes.settings.azure_ad_login
          ?.login_mechanism_name ?? 'Azure Active Directory';

      return formatMessage(oldMessages.continueWithAzure, {
        azureProviderName,
      });
    }

    return formatMessage(messages.continueWithFranceConnect);
  };

  const getIconColor = () => {
    if (ssoProvider === 'facebook') return colors.facebook;
    if (ssoProvider === 'azureactivedirectory') return colors.teal300;
    return;
  };

  const handleClickSSO = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClickSSO(ssoProvider);
  };

  return (
    <Box mt="12px">
      <Button onClick={handleClickSSO} disabled={disabled}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          {ssoProvider === 'google' ||
          ssoProvider === 'facebook' ||
          ssoProvider === 'azureactivedirectory' ? (
            <Icon
              name={ICON_NAME_MAP[ssoProvider]}
              fill={getIconColor()}
              width="18px"
              height="18px"
              mr="8px"
            />
          ) : (
            <Image src={franceConnectImage} alt="" width="18px" mr="8px" />
          )}
          <Box>{getText()}</Box>
        </Box>
      </Button>
    </Box>
  );
};

export default SSOButton;
