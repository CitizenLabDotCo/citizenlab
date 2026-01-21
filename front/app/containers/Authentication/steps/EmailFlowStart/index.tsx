import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import sharedMessages from '../messages';

import EmailForm from './EmailForm';
import messages from './messages';
import SSOButtonsExceptFC from './SSOButtonsExceptFC';

const StyledA = styled.a`
  font-size: ${fontSizes.base}px;
`;

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const EmailFlowStart = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
}: Props) => {
  const { passwordLoginEnabled, ssoProviders, azureAdSettings } =
    useAuthConfig();

  const { formatMessage } = useIntl();

  const anySSOProviderEnabledBesidesFC = keys(ssoProviders)
    .filter((key) => key !== 'franceconnect')
    .some((key) => ssoProviders[key]);

  return (
    <Box data-cy="email-flow-start">
      {ssoProviders.franceconnect && (
        <>
          <FranceConnectButton
            logoAlt={formatMessage(oldMessages.signUpButtonAltText, {
              loginMechanismName: 'FranceConnect',
            })}
            onClick={() => onSwitchToSSO('franceconnect')}
          />
          {(passwordLoginEnabled || anySSOProviderEnabledBesidesFC) && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <>
          <EmailForm
            loading={loading}
            topText={sharedMessages.enterYourEmailAddress}
            setError={setError}
            onSubmit={onSubmit}
          />
          {anySSOProviderEnabledBesidesFC && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {anySSOProviderEnabledBesidesFC && (
        <SSOButtonsExceptFC onClickSSO={onSwitchToSSO} />
      )}
      {azureAdSettings?.visibility === 'link' && (
        <Box mt="24px">
          <StyledA href="/sign-in/admin">
            {formatMessage(messages.clickHereToLoginAsAdminOrPM)}
          </StyledA>
        </Box>
      )}
    </Box>
  );
};

export default EmailFlowStart;
