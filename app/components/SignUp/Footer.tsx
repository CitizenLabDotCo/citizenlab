import React from 'react';
import Rx from 'rxjs/Rx';
import { get } from 'lodash';

// components
// import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';

// services
import { globalState, IIdeasNewPageGlobalState } from 'services/globalState';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { AUTH_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';

// logos
const googleLogo = require('./google.svg') as string;
const facebookLogo = require('./facebook.svg') as string;

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
  height: 60px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  cursor: pointer;

  &.google:hover,
  &.google.active {
    border-color: #2a81f4;
  }

  &.facebook:hover,
  &.facebook.active {
    border-color: #345697;
  }
`;

// const SocialSignInButtonLogo = styled.div``;

// const SocialSignInButton = styled(Button)`
//   .Button {
//     background: #fff !important;
//     border: solid 1px #eaeaea !important;
//   }

//   &:hover {
//     .Button {
//       border-color: #ccc !important;
//     }
//   }
// `;

// const GoogleLogin = SocialSignInButton.extend`
//   margin-right: 15px;

//   .Button {
//     color: #518EF8 !important;
//   }
// `;

// const FacebookLogin = SocialSignInButton.extend`
//   .Button {
//     color: #4B6696 !important;
//   }
// `;

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
  socialLoginUrlParameter: string;
}

class Footer extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
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

  handleOnSSOClick = (provider) => () => {
    window.location.href = `${AUTH_PATH}/${provider}${this.state.socialLoginUrlParameter}`;
  }

  render() {
    const { tenant } = this.props;
    const { formatMessage } = this.props.intl;
    const googleLoginEnabled = (tenant ? get(tenant.attributes.settings.google_login, 'enabled', false) : false);
    const facebookLoginEnabled = (tenant ? get(tenant.attributes.settings.facebook_login, 'enabled', false) : false); 
    const showSocialLogin = (googleLoginEnabled || facebookLoginEnabled);

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
                <SocialSignInButton className={`google ${}`} onClick={this.handleOnSSOClick('google')}>
                  <img src={googleLogo} height="31px" role="presentation" alt="" />
                </SocialSignInButton>
              </FeatureFlag>
              <FeatureFlag name="facebook_login">
                <SocialSignInButton className={`facebook ${}`} onClick={this.handleOnSSOClick('google')}>
                  <img src={facebookLogo} height="23px" role="presentation" alt="" />
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
