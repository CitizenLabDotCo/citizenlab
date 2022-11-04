import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import { StyledAuthProviderButton } from 'containers/SignUpInPage/AuthProviders';
import { TOnContinueFunction } from 'containers/SignUpInPage/AuthProviderButton';

// typings
import { TSignUpInFlow } from 'containers/SignUpInPage/SignUpIn';

interface Props {
  flow: TSignUpInFlow;
  onContinue: TOnContinueFunction;
}

const ViennaSamlButton = ({ onContinue, flow }: Props) => {
  const setHref = () => {
    window.location.href = `${AUTH_PATH}/vienna_citizen`;
  };
  const handleOnContinue = () => {
    if (flow === 'signup') {
      window.location.href =
        'https://mein.wien.gv.at/Registrieren?branding=citizenlab';
    } else {
      onContinue('id_vienna_saml', setHref);
    }
  };
  return (
    <StyledAuthProviderButton
      authProvider="id_vienna_saml"
      onContinue={handleOnContinue}
      flow={flow}
      showConsentOnFlow={'signin'}
    >
      <FormattedMessage {...messages.continueWithStandardPortal} />
    </StyledAuthProviderButton>
  );
};

export default ViennaSamlButton;
