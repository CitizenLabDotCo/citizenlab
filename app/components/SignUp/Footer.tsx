import React from 'react';
import { Subscription } from 'rxjs';
import { get } from 'lodash-es';
import Link from 'utils/cl-router/Link';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { isNilOrError } from 'utils/helperUtils';

// components
import FeatureFlag from 'components/FeatureFlag';
import TermsCheckbox from './TermsCheckbox';
import LoginProviderImage from './LoginProviderImage';

// services
import { globalState, IIdeasNewPageGlobalState } from 'services/globalState';

// resources
import { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { AUTH_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

// logos
const googleLogoUrl = require('./google.svg') as string;
const facebookLogoUrl = require('./facebook.svg') as string;

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

const SocialSignUpButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SocialSignUpButton = styled.div`
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

  ${media.largePhone`
    height: 90px;
  `}

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

const AzureAdSignUpButton = SocialSignUpButton.extend`
  &:hover {
    border-color: #000;
  }
`;

const SocialSignUpText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 20px;
  margin-left: 4px;
  margin-bottom: 20px;
`;

const AlreadyHaveAnAccount = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

interface InputProps {
  goToSignIn: () => void;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps {}

interface State {
  socialLoginClicked: 'google' | 'facebook' | 'azureactivedirectory' | null;
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
          socialLoginUrlParameter: (globalState && globalState.ideaId ? `?new_idea_id=${globalState.ideaId}&publish=true` : '')
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

  handleOnSSOClick = (provider: 'google' | 'facebook' | 'azureactivedirectory') => () => {
    this.setState(state => ({ socialLoginClicked: (state.socialLoginClicked === provider && !state.socialLoginTaCAccepted ? null : provider) }));
  }

  handleSocialLoginAcceptTaC = (provider: 'google' | 'facebook' | 'azureactivedirectory') => () => {
    this.setState({ socialLoginTaCAccepted: true });
    setTimeout(() => {
      window.location.href = `${AUTH_PATH}/${provider}${this.state.socialLoginUrlParameter}`;
    }, 200);
  }

  render() {
    const { tenant } = this.props;
    const { formatMessage } = this.props.intl;
    const { socialLoginClicked, socialLoginTaCAccepted } = this.state;
    const passwordLoginEnabled = (!isNilOrError(tenant) ? get(tenant.attributes.settings.password_login, 'enabled', false) : false);
    const googleLoginEnabled = (!isNilOrError(tenant) ? get(tenant.attributes.settings.google_login, 'enabled', false) : false);
    const facebookLoginEnabled = (!isNilOrError(tenant) ? get(tenant.attributes.settings.facebook_login, 'enabled', false) : false);
    const socialLoginEnabled = (googleLoginEnabled || facebookLoginEnabled);
    const azureAdLoginEnabled: boolean = get(tenant, 'attributes.settings.azure_ad_login.logo_url');
    const azureAdLogoUrl: string = get(tenant, 'attributes.settings.azure_ad_login.logo_url');
    const tenantLoginMechanismName: string = get(tenant, 'attributes.settings.azure_ad_login.login_mechanism_name');

    if (socialLoginEnabled || azureAdLoginEnabled) {
      return (
        <>
          {passwordLoginEnabled &&
            <Separator />
          }
          <Container>
            <FooterContent>
              {passwordLoginEnabled &&
                <SocialSignUpText>
                  {formatMessage(messages.orSignUpWith)}
                </SocialSignUpText>
              }

              <SocialSignUpButtons>
                <FeatureFlag name="google_login">
                  <SocialSignUpButton
                    className={`google ${socialLoginClicked === 'google' && 'active'}`}
                    onClick={this.handleOnSSOClick('google')}
                  >
                    <TransitionGroup>
                      <TermsCheckbox
                        loginProvider="google"
                        socialLoginClicked={socialLoginClicked}
                        tenantLoginMechanismName="Google"
                        socialLoginTaCAccepted={socialLoginTaCAccepted}
                        onCheck={this.handleSocialLoginAcceptTaC('google')}
                      />
                      <LoginProviderImage
                        logoUrl={googleLogoUrl}
                        logoHeight="29px"
                        timeout={timeout}
                        loginProvider="google"
                        socialLoginClicked={socialLoginClicked}
                        loginMechanismName="Google"
                      />
                    </TransitionGroup>
                  </SocialSignUpButton>
                </FeatureFlag>
                <FeatureFlag name="facebook_login">
                  <SocialSignUpButton
                    className={`facebook ${socialLoginClicked === 'facebook' && 'active'}`}
                    onClick={this.handleOnSSOClick('facebook')}
                  >
                    <TransitionGroup>
                      <TermsCheckbox
                        loginProvider="facebook"
                        socialLoginClicked={socialLoginClicked}
                        tenantLoginMechanismName="Facebook"
                        socialLoginTaCAccepted={socialLoginTaCAccepted}
                        onCheck={this.handleSocialLoginAcceptTaC('facebook')}
                      />
                      <LoginProviderImage
                        logoUrl={facebookLogoUrl}
                        logoHeight="21px"
                        timeout={timeout}
                        loginProvider="facebook"
                        socialLoginClicked={socialLoginClicked}
                        loginMechanismName="Facebook"
                      />
                    </TransitionGroup>
                  </SocialSignUpButton>
                </FeatureFlag>
              </SocialSignUpButtons>

              <FeatureFlag name="azure_ad_login">
                <AzureAdSignUpButton
                  className={`azureactivedirectory ${socialLoginClicked === 'azureactivedirectory' && 'active'}`}
                  onClick={this.handleOnSSOClick('azureactivedirectory')}
                >
                  <TransitionGroup>
                    <TermsCheckbox
                      loginProvider="azureactivedirectory"
                      socialLoginClicked={socialLoginClicked}
                      tenantLoginMechanismName={tenantLoginMechanismName}
                      socialLoginTaCAccepted={socialLoginTaCAccepted}
                      onCheck={this.handleSocialLoginAcceptTaC('azureactivedirectory')}
                    />
                    <LoginProviderImage
                      logoUrl={azureAdLogoUrl}
                      logoHeight="25px"
                      timeout={timeout}
                      loginProvider="azureactivedirectory"
                      socialLoginClicked={socialLoginClicked}
                      loginMechanismName={tenantLoginMechanismName}
                    />
                  </TransitionGroup>
                </AzureAdSignUpButton>
              </FeatureFlag>

              {!passwordLoginEnabled &&
                <AlreadyHaveAnAccount to="/sign-in">
                  <FormattedMessage {...messages.alreadyHaveAnAccount} />
                </AlreadyHaveAnAccount>
              }
            </FooterContent>
          </Container>
        </>
      );
    }

    return null;
  }
}

const FooterWithInjectedIntl = injectIntl<Props>(Footer);

export default FooterWithInjectedIntl;
