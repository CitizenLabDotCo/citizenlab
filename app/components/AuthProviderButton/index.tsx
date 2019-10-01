import React, { PureComponent } from 'react';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// components
import TermsCheckbox from './TermsCheckbox';
import AuthProviderImage from './AuthProviderImage';

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

export type Providers = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

interface Props {
  logoUrl: string;
  logoHeight: string;
  providerName: string;
  provider: Providers;
  onAccept: () => void;
  acceptText: ReactIntl.FormattedMessage.MessageDescriptor;
  altText: ReactIntl.FormattedMessage.MessageDescriptor;
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
    const { logoHeight, logoUrl, provider, providerName, acceptText, altText } = this.props;
    const { status } = this.state;

    return (
      <AuthProviderButtonWrapper
        className={`${provider} ${status !== 'image' && 'active'}`}
        onClick={this.handleOnClick}
      >
        <TransitionGroup>
          {(status !== 'image') ?
            <TermsCheckbox
              timeout={timeout}
              providerName={providerName}
              accepted={status === 'checked'}
              onCheck={this.handleOnCheck}
              acceptText={acceptText}
            />
            :
            <AuthProviderImage
              logoUrl={logoUrl}
              logoHeight={logoHeight}
              timeout={timeout}
              providerName={providerName}
              altText={altText}
            />
          }
        </TransitionGroup>
      </AuthProviderButtonWrapper>
    );
  }

}

export default AuthProviderButton;
