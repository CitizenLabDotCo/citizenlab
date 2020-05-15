import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isString, includes } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import SignUp, { signUpNextStep$, TSignUpSteps, IAction, convertUrlSearchParamsToAction, convertActionToUrlSearchParams } from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';
import SignUpPageMeta from './SignUpPageMeta';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetUserCustomFieldsSchema, { GetUserCustomFieldsSchemaChildProps } from 'resources/GetUserCustomFieldsSchema';

// context
import { PreviousPathnameContext } from 'context';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

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

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  userCustomFieldsSchema: GetUserCustomFieldsSchemaChildProps;
  previousPathName: string | null;
}

interface Props extends InputProps, DataProps {}

interface State {
  action: IAction | null | undefined;
  loaded: boolean;
}

class SignUpPage extends PureComponent<Props & WithRouterProps, State> {
  subscription: Subscription | undefined;

  constructor(props) {
    super(props);
    this.state = {
      action: null,
      loaded: false
    };
  }

  componentDidMount() {
    const action = convertUrlSearchParamsToAction(this.props.location.search);
    this.setState({ action: action || null });
    action && window.history.replaceState(null, '', this.props.location.pathname);

    this.setLoaded();

    this.subscription = signUpNextStep$.subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  componentDidUpdate() {
    this.setLoaded();
  }

  setLoaded = () => {
    const { userCustomFieldsSchema, authUser } = this.props;
    const { action } = this.state;

    if (authUser !== undefined && action !== undefined && userCustomFieldsSchema !== undefined) {
      this.setState({ loaded: true });
    }
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  onSignUpCompleted = () => {
    const { action } = this.state;
    const { previousPathName } = this.props;

    if (action) {
      clHistory.push({
        pathname: action.action_context_pathname,
        search: convertActionToUrlSearchParams(action)
      });
    } else if (previousPathName && !previousPathName.endsWith('/sign-up') && !previousPathName.endsWith('/sign-in')) {
      clHistory.push({
        pathname: previousPathName
      });
    } else {
      clHistory.push('/');
    }
  }

  render() {
    const { location, userCustomFieldsSchema, authUser } = this.props;
    const { action, loaded } = this.state;
    const isInvitation = location.pathname.replace(/\/$/, '').endsWith('invite');
    const token = isString(location.query.token) ? location.query.token : null;
    const title = (isInvitation ? <FormattedMessage {...messages.invitationTitle} /> : undefined);
    const authError = includes(location.pathname, 'authentication-error');
    let initialActiveStep: TSignUpSteps | null = null;

    if (!authError && authUser !== undefined && action !== undefined && userCustomFieldsSchema !== undefined) {
      const hasVerificationStep = action?.action_requires_verification;
      const hasCustomFields = !isNilOrError(userCustomFieldsSchema) && userCustomFieldsSchema.hasCustomFields;

      if (!authUser) {
        initialActiveStep = 'account-creation';
      } else if (hasVerificationStep) {
        initialActiveStep = 'verification';
      } else if (hasCustomFields) {
        initialActiveStep = 'custom-fields';
      } else {
        this.onSignUpCompleted();
      }
    }

    return (
      <>
        <SignUpPageMeta />
        <Container className="e2e-sign-up-page">
          <Left>
            <SignInUpBanner />
          </Left>
          <Right>
            <RightInner>
              {loaded &&
                <SignUp
                  initialActiveStep={initialActiveStep}
                  inModal={false}
                  step1Title={title}
                  isInvitation={isInvitation}
                  token={token}
                  action={action}
                  error={authError}
                  onSignUpCompleted={this.onSignUpCompleted}
                />
              }
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
  userCustomFieldsSchema: <GetUserCustomFieldsSchema />,
  previousPathName: ({ render }) => <PreviousPathnameContext.Consumer>{render as any}</PreviousPathnameContext.Consumer>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
));
