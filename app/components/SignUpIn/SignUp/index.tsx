import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// components
import MethodSelection, { TSignUpMethods } from './MethodSelection';
import PasswordSignup from './PasswordSignup';
import VerificationSteps from 'components/Verification/VerificationSteps';
import CustomFields from './CustomFields';
import SignUpError from './SignUpError';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

// utils
import { isNilOrError, isUndefinedOrError } from 'utils/helperUtils';
import { handleOnSSOClick } from 'services/singleSignOn';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

// const SelectedPhaseEventName = 'signUpFlowNextStep';
// export const signUpNextStep$ = eventEmitter.observeEvent(SelectedPhaseEventName);
// export const signUpGoToNextStep = () =>  eventEmitter.emit(SelectedPhaseEventName);

export type TSignUpSteps = 'method-selection' | 'password-signup' | 'verification' | 'custom-fields';

export interface InputProps {
  inModal: boolean;
  isInvitation?: boolean | undefined;
  token?: string | null | undefined;
  metaData: ISignUpInMetaData;
  error?: boolean;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  activeStep: TSignUpSteps | null | undefined;
  userId: string | null;
  error: boolean;
}

class SignUp extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeStep: undefined,
      userId: null,
      error: false
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { activeStep, error } = state;
    const { authUser, customFieldsSchema, onSignUpCompleted, metaData } = props;
    let nextActiveStep = activeStep;

    if (activeStep === undefined && !isUndefinedOrError(authUser) && !isUndefinedOrError(customFieldsSchema)) {
      nextActiveStep = null;
      const hasCustomFields = !isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields;

      if (authUser === null) { // not logged in
        nextActiveStep = 'method-selection';
      } else if (!authUser.attributes.verified && metaData.verification) { // logged in but not verified and verification required
        nextActiveStep = 'verification';
      } else if (hasCustomFields) { // logged in but not yet completed custom fields and custom fields enabled
        nextActiveStep = 'custom-fields';
      } else {
        onSignUpCompleted();
      }
    }

    return {
      activeStep: nextActiveStep,
      error: props.error || error
    };
  }

  goToNextStep = () => {
    const { activeStep } = this.state;
    const { metaData, customFieldsSchema } = this.props;
    const hasVerificationStep = metaData?.verification;
    const hasCustomFields = !isNilOrError(customFieldsSchema) && customFieldsSchema.hasCustomFields;

    if (activeStep === 'method-selection') {
      this.setState({ activeStep: 'password-signup' });
    } else if (activeStep === 'password-signup' && hasVerificationStep) {
      this.setState({ activeStep: 'verification' });
    } else if (hasCustomFields) {
      this.setState({ activeStep: 'custom-fields' });
    } else {
      this.onSignUpCompleted();
    }
  }

  handleMethodSelectionCompleted = (selectedMethod: TSignUpMethods) => {
    if (selectedMethod === 'email') {
      this.goToNextStep();
    } else {
      handleOnSSOClick(selectedMethod, this.props.metaData);
    }
  }

  handlePasswordSignupCompleted = (userId: string) => {
    this.setState({ userId });
    this.goToNextStep();
  }

  handleVerificationCompleted = () => {
    this.goToNextStep();
  }

  handleCustomFieldsCompleted = () => {
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
    this.setState({
      error: true,
      activeStep: undefined
    });
  }

  render() {
    const { activeStep, error } = this.state;
    const { isInvitation, inModal, token, metaData, className } = this.props;

    if (activeStep) {
      return (
        <Container className={`e2e-sign-up-container ${className}`}>
          {error && <SignUpError />}

          {activeStep === 'method-selection' &&
            <MethodSelection onMethodSelected={this.handleMethodSelectionCompleted} />
          }

          {activeStep === 'password-signup' &&
            <PasswordSignup
              metaData={metaData}
              isInvitation={isInvitation}
              token={token}
              onCompleted={this.handlePasswordSignupCompleted}
              onGoToSignIn={this.props.onGoToSignIn}
            />
          }

          {activeStep === 'verification' &&
            <VerificationSteps
              context={null}
              initialActiveStep="method-selection"
              inModal={inModal}
              onComplete={this.handleVerificationCompleted}
              onError={this.onVerificationError}
            />
          }

          {activeStep === 'custom-fields' &&
            <CustomFields onCompleted={this.handleCustomFieldsCompleted} />
          }
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  customFieldsSchema: <GetCustomFieldsSchema />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignUp {...inputProps} {...dataProps} />}
  </Data>
);
