import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isEmpty } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// components
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import PasswordSignup from 'components/SignUpIn/SignUp/PasswordSignup';
import VerificationSteps from 'components/Verification/VerificationSteps';
import CustomFields from 'components/SignUpIn/SignUp/CustomFields';
import Success from 'components/SignUpIn/SignUp/Success';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { StyledHeaderContainer, StyledHeaderTitle, StyledModalContent } from 'components/SignUpIn/styles';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

// utils
import { isNilOrError, isUndefinedOrError } from 'utils/helperUtils';
import { handleOnSSOClick } from 'services/singleSignOn';

// events
import { signUpActiveStepChange } from 'components/SignUpIn/events';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { HeaderSubtitle } from 'components/UI/Modal';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SignUpHelperText = styled(QuillEditedContent)`
  padding-bottom: 25px;
`;

export type TSignUpSteps = 'auth-providers' | 'password-signup' | 'verification' | 'custom-fields' | 'success';

export interface InputProps {
  metaData: ISignUpInMetaData;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  activeStep: TSignUpSteps | null | undefined;
  userId: string | null;
  error: boolean;
}

class SignUp extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: undefined,
      userId: null,
      error: false
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { activeStep, error } = state;
    const { authUser, onSignUpCompleted, metaData } = props;
    let nextActiveStep = activeStep;

    if (activeStep === undefined && !isUndefinedOrError(authUser)) {
      nextActiveStep = null;

      if (authUser === null) { // not logged in
        nextActiveStep = metaData.isInvitation ? 'password-signup' : 'auth-providers';
      } else if (!authUser.attributes.verified && metaData.verification) { // logged in but not verified and verification required
        nextActiveStep = 'verification';
      } else if (!authUser.attributes.registration_completed_at) { // logged in but not yet completed custom fields and custom fields enabled
        nextActiveStep = 'custom-fields';
      } else if (authUser.attributes.registration_completed_at && props.metaData.inModal) {
        nextActiveStep = 'success';
      } else {
        onSignUpCompleted();
      }
    }

    return {
      activeStep: nextActiveStep,
      error: metaData.error || error
    };
  }

  componentDidMount() {
    signUpActiveStepChange(this.state.activeStep);
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (this.state.activeStep !== prevState.activeStep) {
      signUpActiveStepChange(this.state.activeStep);
    }
  }

  componentWillUnmount() {
    signUpActiveStepChange(undefined);
  }

  goToNextStep = () => {
    const { activeStep } = this.state;
    const { authUser, metaData } = this.props;
    const hasVerificationStep = metaData?.verification;

    if (activeStep === 'auth-providers') {
      this.setState({ activeStep: 'password-signup' });
    } else if (activeStep === 'password-signup' && !isNilOrError(authUser) && !authUser.attributes.verified && hasVerificationStep) {
      this.setState({ activeStep: 'verification' });
    } else if (!isNilOrError(authUser) && !authUser.attributes.registration_completed_at) {
      this.setState({ activeStep: 'custom-fields' });
    } else if (!isNilOrError(authUser) && authUser.attributes.registration_completed_at && this.props.metaData.inModal) {
      this.setState({ activeStep: 'success' });
    } else {
      this.onSignUpCompleted();
    }
  }

  handleOnAuthProviderSelected = (selectedAuthProvider: AuthProvider) => {
    if (selectedAuthProvider === 'email') {
      this.goToNextStep();
    } else {
      handleOnSSOClick(selectedAuthProvider, this.props.metaData);
    }
  }

  handleGoToSignInFlow = () => {
    this.props.onGoToSignIn();
  }

  handleGoBackToSignUpOptions = () => {
    this.setState({ activeStep: 'auth-providers' });
  }

  handlePasswordSignupCompleted = (userId: string) => {
    this.setState({ userId });
    this.goToNextStep();
  }

  handleVerificationCompleted = async () => {
    this.goToNextStep();
  }

  handleCustomFieldsCompleted = () => {
    this.goToNextStep();
  }

  handleSuccessOnClose = () => {
    this.onSignUpCompleted();
  }

  onSignUpCompleted = () => {
    trackEventByName(tracks.successfulSignUp);
    this.props.onSignUpCompleted();
  }

  goToSignIn = () => {
    clHistory.push('/sign-in');
  }

  onVerificationError = () => {
    this.setState({ error: true });
  }

  render() {
    const { activeStep, error } = this.state;
    const { tenant, metaData, customFieldsSchema, className, intl: { formatMessage } } = this.props;
    const helperText = isNilOrError(tenant) ? null : tenant.attributes.settings.core.signup_helper_text;
    const hasVerificationStep = metaData?.verification;
    const hasCustomFields = !isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields;
    let stepName: string | null = null;
    const steps: TSignUpSteps[] = [];

    hasVerificationStep && steps.push('verification');
    hasCustomFields && steps.push('custom-fields');

    if (activeStep) {
      const totalStepsCount = steps.length + 1;
      const activeStepNumber = steps.indexOf(activeStep) > -1 ?  steps.indexOf(activeStep) + 2 : 1;

      if (activeStep === 'auth-providers' || activeStep === 'password-signup') {
        stepName = formatMessage(messages.createYourAccount);
      } else if (activeStep === 'verification') {
        stepName = formatMessage(messages.verifyYourIdentity);
      } else if (activeStep === 'custom-fields') {
        stepName = formatMessage(messages.completeYourProfile);
      }

      const showStepsCount = !!(!error && totalStepsCount > 1 && activeStepNumber > 0 && stepName);

      return (
        <Container className={`e2e-sign-up-container ${className}`}>
          {activeStep !== 'success' &&
            <StyledHeaderContainer inModal={!!metaData.inModal}>
              <StyledHeaderTitle inModal={!!metaData.inModal}>
                <FormattedMessage {...messages.signUp2} />
              </StyledHeaderTitle>

              {!error && stepName &&
                <HeaderSubtitle>
                  {showStepsCount
                    ? <FormattedMessage {...messages.headerSubtitle} values={{ activeStepNumber, totalStepsCount, stepName }} />
                    : stepName
                  }
                </HeaderSubtitle>
              }
            </StyledHeaderContainer>
          }

          <StyledModalContent inModal={!!metaData.inModal}>
            {error ? (
              <Error
                text={formatMessage(messages.somethingWentWrongText)}
                animate={false}
              />
            ) : (
              <>
                {activeStep === 'auth-providers' && !isEmpty(helperText) &&
                  <SignUpHelperText
                    textColor={colors.text}
                    fontSize="base"
                    fontWeight={300}
                  >
                    <T value={helperText} supportHtml />
                  </SignUpHelperText>
                }

                {activeStep === 'auth-providers' &&
                  <AuthProviders
                    flow={metaData.flow}
                    onAuthProviderSelected={this.handleOnAuthProviderSelected}
                    goToOtherFlow={this.handleGoToSignInFlow}
                  />
                }

                {activeStep === 'password-signup' &&
                  <PasswordSignup
                    metaData={metaData}
                    hasNextStep={steps.length > 0}
                    onCompleted={this.handlePasswordSignupCompleted}
                    onGoToSignIn={this.props.onGoToSignIn}
                    onGoBack={this.handleGoBackToSignUpOptions}
                  />
                }

                {activeStep === 'verification' &&
                  <VerificationSteps
                    context={metaData?.verificationContext || null}
                    initialActiveStep="method-selection"
                    inModal={!!metaData.inModal}
                    showHeader={false}
                    onComplete={this.handleVerificationCompleted}
                    onError={this.onVerificationError}
                  />
                }

                {activeStep === 'custom-fields' &&
                  <CustomFields
                    onCompleted={this.handleCustomFieldsCompleted}
                  />
                }

                {activeStep === 'success' &&
                  <Success
                    onClose={this.handleSuccessOnClose}
                  />
                }
              </>
            )}
          </StyledModalContent>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  customFieldsSchema: <GetCustomFieldsSchema />
});

const SignUpWithHoC = injectIntl(SignUp);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
