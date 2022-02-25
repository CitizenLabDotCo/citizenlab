import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import {
  AuthProvider,
  StyledAuthProviderButton,
} from 'components/SignUpIn/AuthProviders';

// typings
import { TSignUpInFlow } from 'components/SignUpIn';

interface Props {
  flow: TSignUpInFlow;
  onContinue: (
    authProvider: AuthProvider,
    setHrefFromModule?: () => void
  ) => void;
}

const ViennaSamlButton = ({ onContinue, ...otherProps }: Props) => {
  const setHref = () => {
    window.location.href = `${AUTH_PATH}/saml`;
  };
  const handleOnContinue = () => {
    onContinue('id_vienna_saml', setHref);
  };
  return (
    <StyledAuthProviderButton
      authProvider="id_vienna_saml"
      onContinue={handleOnContinue}
      {...otherProps}
    >
      <FormattedMessage {...messages.continueWithStandardPortal} />
    </StyledAuthProviderButton>
  );
};

export default ViennaSamlButton;
