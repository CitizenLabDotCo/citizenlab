import React, { PureComponent } from 'react';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// components
import TermsCheckbox from './TermsCheckbox';
import AuthProviderImage from './AuthProviderImage';

// intl
import messages from './messages';

const timeout = 250;

const AuthProviderButtonWrapper = styled.button`
  width: 100%;
  height: 58px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};
  user-select: none;
  cursor: pointer;
  position: relative;
  text-align: left;

  ${media.largePhone`
    height: 90px;
  `}

  &:disabled {
    background: ${colors.lightGreyishBlue};
    cursor: not-allowed;
  }


  &:not(:disabled) {
    &:hover {
      border-color: #000;
    }

    &.franceconnect:hover,
    &.franceconnect:active {
      border-color: #0e4fa1;
    }

    &.google:hover,
    &.google.active {
      border-color: #2a81f4;
    }

    &.facebook:hover,
    &.facebook.active {
      border-color: #345697;
    }

    a:hover > span {
      color: #000 !important;
      text-decoration: underline;
    }
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
`;

export const AuthProviderButtonInner = styled.div`
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

export type Provider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

interface Props {
  logoUrl: string;
  logoHeight: string;
  providerName: string;
  provider: Provider;
  onAccept: () => void;
  mode: 'signUp' | 'signIn';
  disabled?: boolean;
}

interface State {
  status: 'image' | 'unchecked' | 'checked';
}

class AuthProviderButton extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      status: 'image',
    };
  }

  handleOnCheck = () => {
    this.setState(
      { status: 'checked' },
      this.props.onAccept
    );
  }

  handleOnClick = (event) => {
    event.preventDefault();
    const { mode } = this.props;
    const { status } = this.state;
    if (mode === 'signUp') {
      this.props.onAccept();
    } else {
      if (status === 'image') {
        this.setState({ status: 'unchecked' });
      } else if (status === 'unchecked') {
        this.setState({ status: 'image' });
      }
    }
  }

  render() {
    const { logoHeight, logoUrl, provider, providerName, mode, disabled } = this.props;
    const { status } = this.state;

    return (
      <AuthProviderButtonWrapper
        className={`${provider} ${status !== 'image' && 'active'}`}
        onClick={this.handleOnClick}
        type="button"
        disabled={disabled}
      >
        <TransitionGroup>
          {(status !== 'image') ?
            <TermsCheckbox
              timeout={timeout}
              providerName={providerName}
              accepted={status === 'checked'}
              onCheck={this.handleOnCheck}
            />
            :
            <AuthProviderImage
              logoUrl={logoUrl}
              logoHeight={logoHeight}
              timeout={timeout}
              providerName={providerName}
              altText={mode === 'signUp' ? messages.signUpButtonAltText : messages.signInButtonAltText}
            />
          }
        </TransitionGroup>
      </AuthProviderButtonWrapper>
    );
  }

}

export default AuthProviderButton;
