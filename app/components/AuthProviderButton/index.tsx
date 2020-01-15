import React, { PureComponent } from 'react';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// components
import TermsCheckbox from './TermsCheckbox';
import FacebookImage from './FacebookImage';
import GoogleImage from './GoogleImage';
import AzureAdImage from './AzureADImage';
import { CSSTransition } from 'react-transition-group';

const timeout = 250;

const AuthProviderButtonWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};
  user-select: none;
  text-align: left;
  padding: 0;
  cursor: pointer;
  min-height: 58px;
  will-change: max-height;
  overflow: hidden;
  transition: all ${timeout}ms ease-out;

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

  &.grow-enter {
    max-height: 58px;
      &.grow-enter-done {
        max-height: 500px;
      }
  }
`;

const AuthProviderButtonInner = styled.div`
  min-height: 58px;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all ${timeout}ms ease-out;
  will-change: opacity;
  overflow: hidden;

  &.tac-enter {
    opacity: 0;
    max-height: 58px;

    &.tac-enter-active {
      opacity: 1;
      max-height: 500px;
    }
  }

  &.tac-exit {
    opacity: 1;
    max-height: 58px;

    &.tac-exit-active {
      opacity: 0;
      max-height: 500px;
    }
  }
`;

type Provider = 'google' | 'facebook' | 'azureactivedirectory';
// | 'franceconnect' => special case, not handled by this component

interface Props {
  providerName: string;
  provider: Provider;
  onAccept: () => void;
  mode: 'signUp' | 'signIn';
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

  toggleStatus = () => {
    const { status } = this.state;
    if (status === 'image') {
      this.setState({ status: 'unchecked' });
    } else if (status === 'unchecked') {
      this.setState({ status: 'image' });
    }
  }

  handleOnClick = (event) => {
    event.preventDefault();
    this.toggleStatus();
  }
  handleOnKeyDown = (event) => {
    if (event['key'] === 'Enter') {
      this.toggleStatus();
    }
  }

  render() {
    const { provider, providerName, mode } = this.props;
    const { status } = this.state;

    return (
      <CSSTransition
        classNames="grow"
        in={status !== 'image'}
        timeout={timeout}
      >
      <AuthProviderButtonWrapper
        className={`${provider} ${status !== 'image' && 'active'}`}
        tabIndex={status === 'image' ? 0 : -1}
        onClick={status === 'image' ? this.handleOnClick : undefined}
        onKeyDown={status === 'image' ? this.handleOnKeyDown : undefined}
        role={status === 'image' ? 'button' : ''}
      >
        <TransitionGroup>
          {status !== 'image' ?
            <CSSTransition classNames="tac" timeout={timeout} exit={false} enter={true}>
              <AuthProviderButtonInner>
                <TermsCheckbox
                  providerName={providerName}
                  accepted={status === 'checked'}
                  onCheck={this.handleOnCheck}
                  mode={mode}
                />
              </AuthProviderButtonInner>
            </CSSTransition>
            :
            <CSSTransition classNames="tac" timeout={timeout} exit={true} enter={false}>
              <AuthProviderButtonInner>
                {provider === 'facebook' &&
                  <FacebookImage
                    mode={mode}
                    providerName={providerName}
                  />
                }
                {provider === 'google' &&
                  <GoogleImage
                    mode={mode}
                    providerName={providerName}
                  />
                }
                {provider === 'azureactivedirectory' &&
                  <AzureAdImage
                    mode={mode}
                    providerName={providerName}
                  />
                }
              </AuthProviderButtonInner>
            </CSSTransition>
          }
        </TransitionGroup>
      </AuthProviderButtonWrapper>
      </CSSTransition>
    );
  }

}

export default AuthProviderButton;
