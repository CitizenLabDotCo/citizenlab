import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isEmpty, cloneDeep, indexOf } from 'lodash-es';
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
import ReactResizeDetector from 'react-resize-detector';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetUserCustomFieldsSchema, { GetUserCustomFieldsSchemaChildProps } from 'resources/GetUserCustomFieldsSchema';

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
import tracks from 'components/SignUpIn/tracks';

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
  windowHeight: number;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  customFieldsSchema: GetUserCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  steps: ('create-account' | Extract<TSignUpSteps, 'verification' | 'custom-fields'>)[];
  activeStep: TSignUpSteps | null | undefined;
  userId: string | null;
  error: boolean;
  headerHeight: string;
}

class SignUp extends PureComponent<Props & InjectedIntlProps, State> {
  modalContentRef: HTMLDivElement | null = null;

  constructor(props) {
    super(props);
    this.state = {
      steps: [],
      activeStep: undefined,
      userId: null,
      error: false,
      headerHeight: '100px'
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
    const { metaData, customFieldsSchema } = this.props;
    const { activeStep } = this.state;
    const steps = cloneDeep(this.state.steps);

    trackEventByName(tracks.signUpFlowEntered);

    signUpActiveStepChange(this.state.activeStep);

    if (activeStep === 'auth-providers' || activeStep === 'password-signup') {
      steps.push('create-account');
    }

    if (metaData.verification) {
      steps.push('verification');
    }

    if (!isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields) {
      steps.push('custom-fields');
    }

    if (steps.length !== this.state.steps.length) {
      this.setState({ steps });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { customFieldsSchema } = this.props;

    if (isNilOrError(prevProps.customFieldsSchema) && !isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields) {
      this.setState(({ steps }) => ({ steps: [...steps, 'custom-fields'] }));
    }

    if (this.state.activeStep !== prevState.activeStep) {
      signUpActiveStepChange(this.state.activeStep);
    }
  }

  componentWillUnmount() {
    trackEventByName(tracks.signUpFlowExited);
    signUpActiveStepChange(undefined);
  }

  goToNextStep = () => {
    const { activeStep } = this.state;
    const { authUser, metaData } = this.props;
    const hasVerificationStep = metaData?.verification;

    if (this.modalContentRef) {
      this.modalContentRef.scrollTop = 0;
    }

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

  handleVerificationCompleted = () => {
    trackEventByName(tracks.signUpVerificationStepCompleted);
    this.goToNextStep();
  }

  handleVerificationSkipped = () => {
    trackEventByName(tracks.signUpVerificationStepSkipped);
    this.goToNextStep();
  }

  handleVerificationError = () => {
    trackEventByName(tracks.signUpVerificationStepFailed);
    this.setState({ error: true });
  }

  handleCustomFieldsCompleted = () => {
    this.goToNextStep();
  }

  handleSuccessOnClose = () => {
    this.onSignUpCompleted();
  }

  onSignUpCompleted = () => {
    trackEventByName(tracks.signUpFlowCompleted);
    this.props.onSignUpCompleted();
  }

  goToSignIn = () => {
    clHistory.push('/sign-in');
  }

  onResize = (_width, height) => {
    this.setState({ headerHeight: `${Math.round(height) + 2}px` });
  }

  setRef = (element: HTMLDivElement) => {
    this.modalContentRef = element;
  }

  render() {
    const { activeStep, error, steps, headerHeight } = this.state;
    const { tenant, metaData, windowHeight, className, intl: { formatMessage } } = this.props;
    const helperText = isNilOrError(tenant) ? null : tenant.attributes.settings.core.signup_helper_text;
    let stepName: string | null = null;

    if (activeStep) {
      const totalStepsCount = steps.length;
      const activeStepNumber = indexOf(steps, activeStep) > -1 ?  indexOf(steps, activeStep) + 1 : 1;

      if (activeStep === 'auth-providers' || activeStep === 'password-signup') {
        stepName = formatMessage(messages.createYourAccount);
      } else if (activeStep === 'verification') {
        stepName = formatMessage(messages.verifyYourIdentity);
      } else if (activeStep === 'custom-fields') {
        stepName = formatMessage(messages.completeYourProfile);
      }

      const showStepsCount = !!(!error && totalStepsCount > 1 && activeStepNumber > 0 && stepName);
      const hasHeader = activeStep !== 'success';
      const hasHeaderSubtitle = !!(activeStep !== 'success' && !error && stepName);

      return (
        <Container id="e2e-sign-up-container" className={className || ''}>
          {hasHeader &&
            <div>
              <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}>
                <StyledHeaderContainer inModal={!!metaData.inModal}>
                  <StyledHeaderTitle inModal={!!metaData.inModal}>
                    <FormattedMessage {...messages.signUp2} />
                  </StyledHeaderTitle>

                  {hasHeaderSubtitle &&
                    <HeaderSubtitle>
                      {showStepsCount ? (
                        <FormattedMessage
                          {...messages.headerSubtitle}
                          values={{
                            activeStepNumber,
                            stepName,
                            totalStepsCount
                          }}
                        />
                      ) : stepName}
                    </HeaderSubtitle>
                  }
                </StyledHeaderContainer>
              </ReactResizeDetector>
            </div>
          }

          <StyledModalContent
            inModal={!!metaData.inModal}
            windowHeight={`${windowHeight}px`}
            headerHeight={headerHeight}
            ref={this.setRef}
          >
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
                    metaData={metaData}
                    onAuthProviderSelected={this.handleOnAuthProviderSelected}
                    goToOtherFlow={this.handleGoToSignInFlow}
                  />
                }

                {activeStep === 'password-signup' &&
                  <PasswordSignup
                    metaData={metaData}
                    hasNextStep={steps.length > 1}
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
                    skippable={true}
                    onComplete={this.handleVerificationCompleted}
                    onSkipped={this.handleVerificationSkipped}
                    onError={this.handleVerificationError}
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
  customFieldsSchema: <GetUserCustomFieldsSchema />
});

const SignUpWithHoC = injectIntl(SignUp);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUpWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
