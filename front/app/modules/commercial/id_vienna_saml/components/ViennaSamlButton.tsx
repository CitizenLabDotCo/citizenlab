import React from 'react';

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
  onContinue: (authProvider: AuthProvider) => void;
}

const ViennaSamlButton = (props: Props) => {
  return (
    <StyledAuthProviderButton authProvider="id_vienna_saml" {...props}>
      <FormattedMessage {...messages.continueWithStandardPortal} />
    </StyledAuthProviderButton>
  );
};

export default ViennaSamlButton;
