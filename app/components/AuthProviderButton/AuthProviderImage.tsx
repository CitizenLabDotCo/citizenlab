import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  logoUrl: string;
  logoHeight: string;
  providerName: string;
  mode: 'signUp' | 'signIn';
}

const AuthProviderImage = ({
  logoUrl,
  logoHeight,
  providerName,
  mode,
  intl: { formatMessage }
}: Props & InjectedIntlProps) => {

  return (
    <img
      src={logoUrl}
      height={logoHeight}
      alt={formatMessage(mode === 'signUp' ? messages.signUpButtonAltText : messages.signInButtonAltText, { loginMechanismName: providerName })}
    />
  );

};

export default injectIntl<Props>(AuthProviderImage);
