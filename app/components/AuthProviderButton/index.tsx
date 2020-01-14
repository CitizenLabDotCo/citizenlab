import React, { PureComponent } from 'react';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// components
import TermsCheckbox from './TermsCheckbox';
import FacebookImage from './FacebookImage';
import GoogleImage from './GoogleImage';
import AzureAdImage from './AzureADImage';

const timeout = 250;

const AuthProviderButtonWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};
  user-select: none;
  text-align: left;
  padding: 0;
  min-height: 58px;

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
  will-change: opacity;

  &.tac-enter {
    opacity: 0;
    position: absolute;
    margin-left: auto;
    margin-right: auto;

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

const ActualButton = styled.button<({ timeout: number }) >`
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${timeout}ms ease-out;
  min-height: 58px;
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

  handleOnClick = (event) => {
    event.preventDefault();

    const { status } = this.state;
    if (status === 'image') {
      this.setState({ status: 'unchecked' });
    } else if (status === 'unchecked') {
      this.setState({ status: 'image' });
    }
  }

  render() {
    const { provider, providerName, mode } = this.props;
    const { status } = this.state;

    return (
      <AuthProviderButtonWrapper
        className={`${provider} ${status !== 'image' && 'active'}`}
      >
        {status !== 'image' ?
          <TermsCheckbox
            timeout={timeout}
            providerName={providerName}
            accepted={status === 'checked'}
            onCheck={this.handleOnCheck}
            mode={mode}
          />
          :
          <ActualButton
            onClick={this.handleOnClick}
            type="button"
            timeout={250}
          >
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
          </ActualButton>
        }
      </AuthProviderButtonWrapper>
    );
  }

}

export default AuthProviderButton;
