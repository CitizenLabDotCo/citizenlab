import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { globalState, IIdeasNewPageGlobalState } from 'services/globalState';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { AUTH_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';

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

const SocialSignInButton = styled(Button)`
  .Button {
    background: #fff !important;
    border: solid 1px #eaeaea !important;
  }

  &:hover {
    .Button {
      border-color: #ccc !important;
    }
  }
`;

const GoogleLogin = SocialSignInButton.extend`
  margin-right: 15px;

  .Button {
    color: #518EF8 !important;
  }
`;

const FacebookLogin = SocialSignInButton.extend`
  .Button {
    color: #4B6696 !important;
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

const SocialSignInButtons = styled.div`
  width: 100%;
  display: flex;
`;

type Props = {
  goToSignIn: () => void;
};

type State = {
  currentTenant: ITenant | null;
  socialLoginUrlParameter: string;
};

class Footer extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      currentTenant: null,
      socialLoginUrlParameter: ''
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const globalState$ = globalState.init<IIdeasNewPageGlobalState>('IdeasNewPage').observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe(currentTenant => this.setState({ currentTenant })),

      globalState$.subscribe((globalState) => {
        this.setState({ socialLoginUrlParameter: (globalState && globalState.ideaId ? `?idea_to_publish=${globalState.ideaId}` : '') });
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
    const { currentTenant } = this.state;
    const { formatMessage } = this.props.intl;
    const googleLoginEnabled = !!_.get(currentTenant, `data.attributes.settings.google_login.enabled`);
    const facebookLoginEnabled = !!_.get(currentTenant, `data.attributes.settings.facebook_login.enabled`);
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
                <GoogleLogin
                  text="Google"
                  style="primary"
                  size="1"
                  icon="google-colored"
                  onClick={this.handleOnSSOClick('google')}
                  circularCorners={true}
                />
              </FeatureFlag>
              <FeatureFlag name="facebook_login">
                <FacebookLogin
                  text="Facebook"
                  style="primary"
                  size="1"
                  icon="facebook-blue"
                  onClick={this.handleOnSSOClick('facebook')}
                  circularCorners={true}
                />
              </FeatureFlag>
            </SocialSignInButtons>
          </FooterContent>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Footer);
