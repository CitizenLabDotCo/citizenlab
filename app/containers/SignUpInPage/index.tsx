import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { Subscription } from 'rxjs';
import { parse } from 'qs';

// components
import SignUpIn, { TSignUpInFlow } from 'components/SignUpIn';
import SignUpInPageMeta from './SignUpInPageMeta';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { isNilOrError, endsWith } from 'utils/helperUtils';

// events
import { signUpActiveStepChange$ } from 'components/SignUpIn/events';

// context
import { PreviousPathnameContext } from 'context';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.main`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  background: ${colors.background};
  position: relative;

  ${media.biggerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Section = styled.div`
  flex: 1;
`;

const Left = styled(Section)`
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Banner = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px;
  padding-top: 58px;
  padding-left: 70px;
  position: relative;
  background: #fff;
`;

const Slogan = styled.div`
  width: 100%;
  max-width: 400px;
  color: ${props => props.theme.colorMain || '#333'};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 44px;
  font-weight: 600;
`;

const Right = styled(Section)``;

const RightInner = styled.div`
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}
`;

export interface InputProps {}

export interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
}

export interface Props extends InputProps, DataProps {}

interface State {
  initialFlow: TSignUpInFlow;
  isInvitation: boolean;
  token?: string;
  error: boolean;
  loaded: boolean;
}

class SignUpPage extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      initialFlow: 'signup',
      isInvitation: false,
      token: undefined,
      error: false,
      loaded: false
    };
  }

  static getDerivedStateFromProps(props: Props & WithRouterProps, state: State) {
    const { authUser, previousPathName, location: { pathname } } = props;
    const isLoggedIn = !isNilOrError(authUser) && authUser.attributes.registration_completed_at;
    const urlSearchParams = parse(props.location.search, { ignoreQueryPrefix: true });
    const token = isString(urlSearchParams?.token) ? urlSearchParams.token : undefined;

    if (isLoggedIn) {
      clHistory.replace(previousPathName || '/');
    }

    if (!state.loaded) {
      const error = endsWith(pathname, 'authentication-error');
      const isInvitation = !!token || endsWith(pathname, 'invite');
      const initialFlow = !isInvitation && endsWith(pathname, 'sign-in') ? 'signin' : 'signup';

      // remove any urlSearchParams so that they don't accidentaly get reused in the future
      window.history.replaceState(null, '', window.location.pathname);

      return {
        initialFlow,
        isInvitation,
        error,
        token,
        loaded: true
      };
    }

    return null;
  }

  componentDidMount() {
    this.subscriptions = [
      signUpActiveStepChange$.subscribe(() => {
        window.scrollTo(0, 0);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpInCompleted = () => {
    clHistory.push(this.props.previousPathName || '/');
  }

  render() {
    const { location: { pathname } } = this.props;
    const { initialFlow, isInvitation, error, token, loaded } = this.state;

    if (loaded) {
      return (
        <>
          {!isInvitation && !error &&
            <SignUpInPageMeta />
          }

          <Container id="e2e-sign-up-in-page">
            <Left>
              <Banner>
                <Slogan>
                  <FormattedMessage {...messages.slogan} />
                </Slogan>
              </Banner>
            </Left>
            <Right>
              <RightInner>
                <SignUpIn
                  metaData={{
                    pathname,
                    error,
                    isInvitation,
                    token,
                    flow: initialFlow,
                    inModal: false,
                    verification: undefined
                  }}
                  onSignUpInCompleted={this.onSignUpInCompleted}
                />
              </RightInner>
            </Right>
          </Container>
        </>
      );
    }

    return null;
  }
}

const SignUpPageWithHoC = withRouter(SignUpPage);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  previousPathName: ({ render }) => <PreviousPathnameContext.Consumer>{render as any}</PreviousPathnameContext.Consumer>
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
