import React from 'react';
import FranceConnectImage from './franceconnect.png';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Image } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import oldMessages from 'containers/Authentication/steps/AuthProviders/messages';

// typings
import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

const Container = styled.div`
  margin-top: 12px;
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
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const ICON_MAP = {
  facebook: 'facebook',
  google: 'google',
  azureactivedirectory: 'microsoft-windows',
} as const;

const COLOR_MAP = {
  facebook: colors.facebook,
  azureactivedirectory: colors.teal400,
};

const MESSAGE_MAP = {
  facebook: oldMessages.continueWithFacebook,
  google: oldMessages.continueWithGoogle,
} as const;

const SSOButton = ({ ssoProvider, onClickSSO }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  const handleClickSSO = () => onClickSSO(ssoProvider);

  if (ssoProvider === 'franceconnect') {
    return (
      <Container>
        <Button
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
        </Button>
      </Container>
    );
  }

  const azureProviderName =
    appConfiguration.data.attributes.settings.azure_ad_login
      ?.login_mechanism_name ?? 'Azure Active Directory';

  return (
    <Container>
      <Button
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
        {ssoProvider === 'azureactivedirectory'
          ? formatMessage(oldMessages.continueWithAzure, { azureProviderName })
          : formatMessage(MESSAGE_MAP[ssoProvider])}
      </Button>
    </Container>
  );
};

export default SSOButton;
