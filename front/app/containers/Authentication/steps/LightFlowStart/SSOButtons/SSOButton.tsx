import React from 'react';

import { Image, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import oldMessages from 'containers/Authentication/steps/AuthProviders/messages';
import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import FranceConnectImage from './franceconnect.png';
import messages from './messages';

const Container = styled.div<{ marginTop: string }>`
  margin-top: ${({ marginTop }) => marginTop};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  transition: all 100ms ease-out;

  &:hover {
    border-color: ${colors.grey800};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
  }
`;

interface Props {
  ssoProvider: SSOProviderWithoutVienna;
  marginTop?: string;
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const ICON_MAP = {
  facebook: 'facebook',
  google: 'google',
  azureactivedirectory: 'microsoft-windows',
  azureactivedirectory_b2c: 'microsoft-windows',
} as const;

const COLOR_MAP = {
  facebook: colors.facebook,
  azureactivedirectory: colors.teal400,
  azureactivedirectory_b2c: colors.teal400,
};

const MESSAGE_MAP = {
  facebook: oldMessages.continueWithFacebook,
  google: oldMessages.continueWithGoogle,
} as const;

const SSOButton = ({ ssoProvider, marginTop = '12px', onClickSSO }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const handleClickSSO = () => onClickSSO(ssoProvider);

  if (ssoProvider === 'franceconnect') {
    return (
      <Container marginTop={marginTop}>
        <ButtonWithLink
          buttonStyle="white"
          iconSize="22px"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          padding="10px 18px"
          onClick={handleClickSSO}
        >
          <Image src={FranceConnectImage} alt="" height="28px" mr="8px" />
          {formatMessage(messages.continueWithFranceConnect)}
        </ButtonWithLink>
      </Container>
    );
  }

  const azureProviderName =
    appConfiguration.data.attributes.settings.azure_ad_login
      ?.login_mechanism_name ?? 'Azure Active Directory';

  const azureB2cProviderName =
    appConfiguration.data.attributes.settings.azure_ad_b2c_login
      ?.login_mechanism_name ?? 'Azure Active Directory B2C';

  const getButtonText = () => {
    switch (ssoProvider) {
      case 'azureactivedirectory':
        return formatMessage(oldMessages.continueWithAzure, {
          azureProviderName,
        });
      case 'azureactivedirectory_b2c':
        return formatMessage(oldMessages.continueWithAzure, {
          azureProviderName: azureB2cProviderName,
        });
      default:
        return formatMessage(MESSAGE_MAP[ssoProvider]);
    }
  };

  return (
    <Container marginTop={marginTop}>
      <ButtonWithLink
        icon={ICON_MAP[ssoProvider]}
        iconColor={COLOR_MAP[ssoProvider]}
        iconHoverColor={COLOR_MAP[ssoProvider]}
        buttonStyle="white"
        iconSize="22px"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        padding="10px 18px"
        onClick={handleClickSSO}
      >
        {getButtonText()}
      </ButtonWithLink>
    </Container>
  );
};

export default SSOButton;
