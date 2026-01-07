import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import oldMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';
import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

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
          {passwordLoginEnabled && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <EmailForm
          loading={loading}
          topText={messages.dropUsYourEmailIfYouWantToStayUpdated}
          setError={setError}
          onSubmit={onSubmit}
        />
      )}
      <SSOButtonsExceptFC onClickSSO={onSwitchToSSO} />
    </Box>
  );
};

export default PostParticipationFlowStart;
