import React from 'react';
import { Subscription } from 'rxjs/Rx';
import { get } from 'lodash';
import { Link } from 'react-router';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { isNilOrError } from 'utils/helperUtils';

// components
import FeatureFlag from 'components/FeatureFlag';
import Checkbox from 'components/UI/Checkbox';

// services
import { globalState, IIdeasNewPageGlobalState } from 'services/globalState';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { AUTH_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';

// logos
const googleLogo = require('./google.svg') as string;
const facebookLogo = require('./facebook.svg') as string;

const timeout = 250;

const Container = styled.div`
  width: 100%;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const FooterContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SocialSignInButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SocialSignInButton = styled.div`
  width: 100%;
  height: 58px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  user-select: none;
  cursor: pointer;
  position: relative;

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
    font-size: 15px;
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

const SocialSignInButtonInner = styled.div`
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

const SocialSignInText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 300;
  line-height: 20px;
  margin-left: 4px;
  margin-bottom: 20px;
`;

interface InputProps {
  goToSignIn: () => void;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  socialLoginClicked: 'google' | 'facebook' | null;
  socialLoginTaCAccepted: boolean;
  socialLoginUrlParameter: string;
}

class Footer extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      socialLoginClicked: null,
      socialLoginTaCAccepted: false,
      socialLoginUrlParameter: ''
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const globalState$ = globalState.init<IIdeasNewPageGlobalState>('IdeasNewPage').observable;

    this.subscriptions = [
      globalState$.subscribe((globalState) => {
        this.setState({
          socialLoginUrlParameter: (globalState && globalState.ideaId ? `?idea_to_publish=${globalState.ideaId}` : '')
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnClick = () => {
    this.props.goToSignIn();
  }

  handleOnSSOClick = (provider: 'google' | 'facebook') => () => {
    this.setState(state => ({ socialLoginClicked: (state.socialLoginClicked === provider && !state.socialLoginTaCAccepted ? null : provider) }));
  }

  handleSocialLoginAcceptTaC = (provider: 'google' | 'facebook') => () => {
    this.setState({ socialLoginTaCAccepted: true });
    setTimeout(() => {
      window.location.href = `${AUTH_PATH}/${provider}${this.state.socialLoginUrlParameter}`;
    }, 200);
  }

  render() {
    const { tenant } = this.props;
    const { formatMessage } = this.props.intl;
    const { socialLoginClicked, socialLoginTaCAccepted } = this.state;
    const googleLoginEnabled = (!isNilOrError(tenant) ? get(tenant.attributes.settings.google_login, 'enabled', false) : false);
    const facebookLoginEnabled = (!isNilOrError(tenant) ? get(tenant.attributes.settings.facebook_login, 'enabled', false) : false); 
    const showSocialLogin = (googleLoginEnabled || facebookLoginEnabled);

    const googleCheckbox = (socialLoginClicked === 'google' && (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SocialSignInButtonInner>
          <Checkbox 
            value={socialLoginTaCAccepted}
            onChange={this.handleSocialLoginAcceptTaC('google')}
            disableLabelClick={true}
            label={
              <FormattedMessage
                {...messages.acceptTermsAndConditionsGoogle} 
                values={{ tacLink: <Link to="pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link> }}
              />
            }
          />
        </SocialSignInButtonInner>
      </CSSTransition>
    ));

    const googleImage = (socialLoginClicked !== 'google' && (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SocialSignInButtonInner>
          <img src={googleLogo} height="29px" role="presentation" alt="" />
        </SocialSignInButtonInner>
      </CSSTransition>
    ));

    const facebookCheckbox = (socialLoginClicked === 'facebook' && (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SocialSignInButtonInner>
          <Checkbox 
            value={socialLoginTaCAccepted}
            onChange={this.handleSocialLoginAcceptTaC('facebook')}
            disableLabelClick={true}
            label={
              <FormattedMessage
                {...messages.acceptTermsAndConditionsFacebook} 
                values={{ tacLink: <Link to="pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link> }}
              />
            }
          />
        </SocialSignInButtonInner>
      </CSSTransition>
    ));

    const facebookImage = (socialLoginClicked !== 'facebook' && (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SocialSignInButtonInner>
          <img src={facebookLogo} height="21px" role="presentation" alt="" />
        </SocialSignInButtonInner>
      </CSSTransition>
    ));

    if (showSocialLogin) {
      return (
        <Container>
          <Separator />
          <FooterContent>
            <SocialSignInText>
              {formatMessage(messages.orSignUpWith)}
            </SocialSignInText>
            <SocialSignInButtons>
              <FeatureFlag name="google_login">
                <SocialSignInButton 
                  className={`google ${socialLoginClicked === 'google' && 'active'}`} 
                  onClick={this.handleOnSSOClick('google')}
                >
                  <TransitionGroup>
                    {googleCheckbox}
                    {googleImage}
                  </TransitionGroup>
                </SocialSignInButton>
              </FeatureFlag>
              <FeatureFlag name="facebook_login">
                <SocialSignInButton
                  className={`facebook ${socialLoginClicked === 'facebook' && 'active'}`}
                  onClick={this.handleOnSSOClick('facebook')}
                >
                  <TransitionGroup>
                    {facebookCheckbox}
                    {facebookImage}
                  </TransitionGroup>
                </SocialSignInButton>
              </FeatureFlag>
            </SocialSignInButtons>
          </FooterContent>
        </Container>
      );
    }

    return null;
  }
}

const FooterWithInjectedIntl = injectIntl<Props>(Footer);

export default (inputProps: InputProps) => (
  <GetTenant>
    {tenant => <FooterWithInjectedIntl {...inputProps} tenant={tenant} />}
  </GetTenant>
);
