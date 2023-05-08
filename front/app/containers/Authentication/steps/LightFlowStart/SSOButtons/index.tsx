import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';
import Or from 'components/UI/Or';
import Error from 'components/UI/Error';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = (props: Props) => {
  const { formatMessage } = useIntl();

  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });

  if (
    !googleLoginEnabled &&
    !facebookLoginEnabled &&
    !franceconnectLoginEnabled &&
    !azureAdLoginEnabled
  ) {
    if (passwordLoginEnabled) {
      return null;
    }

    // This should never actually happen
    return (
      <Error text={formatMessage(messages.noAuthenticationMethodsEnabled)} />
    );
  }

  return (
    <>
      {passwordLoginEnabled && (
        <Box mt="32px" mb="20px">
          <Or />
        </Box>
      )}
      <Box>
        {googleLoginEnabled && <SSOButton ssoProvider="google" {...props} />}
        {facebookLoginEnabled && (
          <SSOButton ssoProvider="facebook" {...props} />
        )}
        {franceconnectLoginEnabled && (
          <SSOButton ssoProvider="franceconnect" {...props} />
        )}
        {azureAdLoginEnabled && (
          <SSOButton ssoProvider="azureactivedirectory" {...props} />
        )}
      </Box>
    </>
  );
};

export default SSOButtons;
