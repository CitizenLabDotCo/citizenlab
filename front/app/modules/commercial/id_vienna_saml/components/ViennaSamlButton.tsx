import React from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

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

const ViennaSamlButton = (props: Props & InjectedIntlProps) => {
  return (
    <StyledAuthProviderButton authProvider="id_vienna_saml" {...props}>
      <FormattedMessage {...messages.continueWithStandardPortal} />
    </StyledAuthProviderButton>
  );
};

export default injectIntl(ViennaSamlButton);
