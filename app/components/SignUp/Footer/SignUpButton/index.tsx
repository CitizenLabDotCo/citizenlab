import React from 'react';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// components
import TermsCheckbox from './TermsCheckbox';
import LoginProviderImage from './LoginProviderImage';

const timeout = 250;

const SignUpButtonWrapper = styled.button`
  width: 100%;
  height: 58px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 5px;
  border: solid 1px ${colors.separation};
  user-select: none;
  cursor: pointer;
  position: relative;
  text-align: left;

  ${media.largePhone`
    height: 90px;
  `}

  &:hover {
    border-color: #000;
  }

  &.google:hover,
  &.google.active {
    border-color: #2a81f4;
  }

  &.facebook:hover,
  &.facebook.active {
    border-color: #345697;
  }

  span {
    color: #707075 !important;
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 18px;
  }

  a > span {
    color: #707075 !important;
    text-decoration: underline;
  }

  a:hover > span {
    color: #000 !important;
    text-decoration: underline;
  }
`;

export const SignUpButtonInner = styled.div`
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
  transition: all ${timeout}ms ease-out;
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
  loginProvider: 'google' | 'facebook' | 'azureactivedirectory';
  socialLoginClicked: 'google' | 'facebook' | 'azureactivedirectory' | null;
  loginMechanismName: string;
  socialLoginTaCAccepted: boolean;
  onClick: () => void;
  onAcceptToC: () => void;
}

const SignUpButton = (props: Props) => {
  const {
    logoHeight,
    logoUrl,
    loginProvider,
    socialLoginClicked,
    socialLoginTaCAccepted,
    loginMechanismName,
    onClick,
    onAcceptToC
  } = props;

  return (
    <SignUpButtonWrapper
      className={`${loginProvider} ${socialLoginClicked === loginProvider && 'active'}`}
      onClick={onClick}
    >
      <TransitionGroup>
        <TermsCheckbox
          timeout={timeout}
          loginProvider={loginProvider}
          socialLoginClicked={socialLoginClicked}
          loginMechanismName={loginMechanismName}
          socialLoginTaCAccepted={socialLoginTaCAccepted}
          onCheck={onAcceptToC}
        />
        <LoginProviderImage
          logoUrl={logoUrl}
          logoHeight={logoHeight}
          timeout={timeout}
          loginProvider={loginProvider}
          socialLoginClicked={socialLoginClicked}
          loginMechanismName={loginMechanismName}
        />
      </TransitionGroup>
    </SignUpButtonWrapper>
  );
};

export default SignUpButton;
