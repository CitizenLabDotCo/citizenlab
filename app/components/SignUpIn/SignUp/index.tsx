import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// components
import AuthProviders, { AuthProvider } from '../AuthProviders';
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
import { media, colors, fontSizes } from 'utils/styleUtils';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px ${colors.separation};
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const HeaderTitle = styled.h1`
  width: 100%;
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  margin-right: 45px;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
    margin-right: 35px;
  `}
`;

const Content = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border: solid 1px red;
  padding: 40px;
`;

export type TSignUpSteps = 'auth-providers' | 'password-signup' | 'verification' | 'custom-fields';

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
    const { authUser, onSignUpCompleted, metaData } = props;
    let nextActiveStep = activeStep;

    if (activeStep === undefined && !isUndefinedOrError(authUser)) {
      nextActiveStep = null;

      if (authUser === null) { // not logged in
        nextActiveStep = 'auth-providers';
      } else if (!authUser.attributes.verified && metaData.verification) { // logged in but not verified and verification required
        nextActiveStep = 'verification';
      } else if (!authUser.attributes.registration_completed_at) { // logged in but not yet completed custom fields and custom fields enabled
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
    const { authUser, metaData } = this.props;
    const hasVerificationStep = metaData?.verification;

    if (activeStep === 'auth-providers') {
      this.setState({ activeStep: 'password-signup' });
    } else if (activeStep === 'password-signup' && !isNilOrError(authUser) && !authUser.attributes.verified && hasVerificationStep) {
      this.setState({ activeStep: 'verification' });
    } else if (!isNilOrError(authUser) && !authUser.attributes.registration_completed_at) {
      this.setState({ activeStep: 'custom-fields' });
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
          <HeaderContainer>
            <HeaderTitle id="modal-header">Zolg</HeaderTitle>
          </HeaderContainer>

          <Content>
            {error && <SignUpError />}

            {activeStep === 'auth-providers' &&
              <AuthProviders
                flow={metaData.flow}
                onAuthProviderSelected={this.handleOnAuthProviderSelected}
              />
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
                showHeader={false}
                onComplete={this.handleVerificationCompleted}
                onError={this.onVerificationError}
              />
            }

            {activeStep === 'custom-fields' &&
              <CustomFields onCompleted={this.handleCustomFieldsCompleted} />
            }
          </Content>
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
