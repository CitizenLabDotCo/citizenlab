import React from 'react';

// styling
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const SocialSignUpButtonInner = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${(props) => props.timeout}ms ease-out;
  will-change: opacity;

  &.tac-enter {
    opacity: 0;
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;

    &.tac-enter-active {
      opacity: 1;
    }
  }

  &.tac-exit {
    opacity: 1;

    &.tac-exit-active {
      opacity: 0;
    }
  }
`;

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
        <SocialSignUpButtonInner>
          <img
            src={logoUrl}
            height={logoHeight}
            alt={props.intl.formatMessage(messages.signUpButtonAltText, { loginMechanismName })}
          />
        </SocialSignUpButtonInner>
      </CSSTransition>
    );
  }

  return null;
};

export default injectIntl<Props>(LoginProviderImage);
