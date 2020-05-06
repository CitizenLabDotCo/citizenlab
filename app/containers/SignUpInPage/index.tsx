import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// components
import SignUpIn from 'components/SignUpIn';
import SignUpInPageMeta from './SignUpInPageMeta';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { endsWith } from 'utils/helperUtils';

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

interface State {}

class SignUpPage extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[] = [];

  componentDidMount() {
    this.subscriptions = [
      signUpActiveStepChange$.subscribe(() => {
        window.scrollTo(0, 0);
      })
    ];
  }

  static getDerivedStateFromProps(props: Props & WithRouterProps, _state: State) {
    const { authUser, previousPathName, location: { pathname } } = props;
    const isOnSignInPage = endsWith(pathname, 'sign-in');
    const isLoggedIn = !isNilOrError(authUser) && authUser.attributes.registration_completed_at;

    if (isOnSignInPage && isLoggedIn) {
      clHistory.replace(previousPathName || '/');
    }

    return null;
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSignUpInCompleted = () => {
    clHistory.push(this.props.previousPathName || '/');
  }

  render() {
    const { location: { pathname, query } } = this.props;
    const flow = endsWith(pathname, 'sign-in') ? 'signin' : 'signup';
    const error = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, 'invite');
    const token = isString(query?.token) ? query.token : undefined;
    const inModal = false;
    const verification = undefined;

    return (
      <>
        {!isInvitation && !error &&
          <SignUpInPageMeta />
        }

        <Container className="e2e-sign-up-in-page">
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
                  flow,
                  pathname,
                  error,
                  isInvitation,
                  token,
                  inModal,
                  verification
                }}
                onSignUpInCompleted={this.onSignUpInCompleted}
              />
            </RightInner>
          </Right>
        </Container>
      </>
    );
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
