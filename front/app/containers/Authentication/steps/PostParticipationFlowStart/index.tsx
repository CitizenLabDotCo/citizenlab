import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';

import EmailForm from '../EmailFlowStart/EmailForm';
import SSOButtonsExceptFC from '../EmailFlowStart/SSOButtonsExceptFC';

import messages from './messages';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const PostParticipationFlowStart = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
}: Props) => {
  const { passwordLoginEnabled, ssoProviders } = useAuthConfig();
  const { formatMessage } = useIntl();

  const anySSOProviderEnabledBesidesFC = keys(ssoProviders)
    .filter((key) => key !== 'franceconnect')
    .some((key) => ssoProviders[key]);

  return (
    <Box data-cy="post-participation-flow-start">
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
            topText={messages.dropUsYourEmailIfYouWantToStayUpdated}
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
    </Box>
  );
};

export default PostParticipationFlowStart;
