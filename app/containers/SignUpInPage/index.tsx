import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isString, includes } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import { signUpNextStep$, TSignUpSteps } from 'components/SignUp';
import SignUpIn, { ISignUpInAction, convertUrlSearchParamsToAction, convertActionToUrlSearchParams } from 'components/SignUpIn';
import SignUpInPageMeta from './SignUpInPageMeta';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

// utils
import { isNilOrError, endsWith } from 'utils/helperUtils';

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
  max-width: 420px;
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
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
  previousPathName: string | null;
}

export interface Props extends InputProps, DataProps {}

interface State {
  action: ISignUpInAction | null | undefined;
}

class SignUpPage extends PureComponent<Props & WithRouterProps, State> {
  subscription: Subscription | undefined;

  constructor(props) {
    super(props);
    this.state = {
      action: null
    };
  }

  componentDidMount() {
    const action = convertUrlSearchParamsToAction(this.props.location.search);
    this.setState({ action: action || null });
    action && window.history.replaceState(null, '', this.props.location.pathname);
    this.subscription = signUpNextStep$.subscribe(() => window.scrollTo(0, 0));
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  onSignUpInCompleted = () => {
    const { action } = this.state;
    const { previousPathName } = this.props;

    if (action) {
      clHistory.push({
        pathname: action.action_context_pathname,
        search: convertActionToUrlSearchParams(action)
      });
    } else if (previousPathName && !endsWith(previousPathName, ['sign-up', 'sign-in', 'complete-signup'])) {
      clHistory.push(previousPathName);
    } else {
      clHistory.push('/');
    }
  }

  render() {
    const { location, customFieldsSchema, authUser } = this.props;
    const { action } = this.state;
    const isInvitation = endsWith(location.pathname, 'invite');
    const token = isString(location.query.token) ? location.query.token : null;
    const authError = includes(location.pathname, 'authentication-error');
    const initialActiveSignUpInMethod = endsWith(location.pathname, 'sign-in') ? 'signin' : 'signup';
    let initialActiveSignUpStep: TSignUpSteps | undefined = undefined;

    if (!authError && authUser !== undefined && action !== undefined && customFieldsSchema !== undefined) {
      const hasVerificationStep = action?.action_requires_verification;
      const hasCustomFields = !isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields;

      if (!authUser) { // not logged in
        initialActiveSignUpStep = 'password-signup';
      } else if (hasVerificationStep) { // logged in but not yet verified and verification required
        initialActiveSignUpStep = 'verification';
      } else if (hasCustomFields) { // logged in and verified, but not yet completed custom fields and custom fields enabled
        initialActiveSignUpStep = 'custom-fields';
      } else {
        this.onSignUpInCompleted();
      }
    }

    return (
      <>
        <SignUpInPageMeta />
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
                initialActiveSignUpInMethod={initialActiveSignUpInMethod}
                initialActiveSignUpStep={initialActiveSignUpStep}
                inModal={false}
                isInvitation={isInvitation}
                token={token}
                action={action}
                error={authError}
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
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  customFieldsSchema: <GetCustomFieldsSchema />,
  previousPathName: ({ render }) => <PreviousPathnameContext.Consumer>{render as any}</PreviousPathnameContext.Consumer>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
));
