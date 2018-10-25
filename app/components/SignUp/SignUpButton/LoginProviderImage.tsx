import React from 'react';

// components
import { SignUpButtonInner } from './index';

// styling
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  logoUrl: string;
  logoHeight: string;
  timeout: number;
  loginProvider: 'google' | 'facebook' | 'azureactivedirectory';
  socialLoginClicked: 'google' | 'facebook' | 'azureactivedirectory' | null;
  loginMechanismName: string;
}

const LoginProviderImage = (props: Props & InjectedIntlProps) => {
  const {
    logoUrl,
    logoHeight,
    timeout,
    loginProvider,
    socialLoginClicked,
    loginMechanismName } = props;

  if (loginProvider !== socialLoginClicked) {
    return (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SignUpButtonInner>
          <img
            src={logoUrl}
            height={logoHeight}
            alt={props.intl.formatMessage(messages.signUpButtonAltText, { loginMechanismName })}
          />
        </SignUpButtonInner>
      </CSSTransition>
    );
  }

  return null;
};

export default injectIntl<Props>(LoginProviderImage);
