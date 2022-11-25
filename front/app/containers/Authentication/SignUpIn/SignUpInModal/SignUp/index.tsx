import React, { useCallback, useEffect, useRef, useState } from 'react';

// services
import { handleOnSSOClick } from 'services/singleSignOn';
import { completeRegistration } from 'services/users';

// components
import Header from './Header';
import AuthProviders, { AuthProvider } from 'components/AuthProviders';
import PasswordSignup from './PasswordSignup';
import ConfirmationSignupStep from './ConfirmationSignupStep';
import CustomFieldsSignupStep from './CustomFieldsSignupStep';
import Success from './Success';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { StyledModalContentContainer } from '../styles';
import VerificationSignUpStep from './VerificationSignUpStep';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';
import useUserCustomFieldsSchema from 'hooks/useUserCustomFieldsSchema';
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  getDefaultSteps,
  getActiveStep,
  getEnabledSteps,
  registrationCanBeCompleted,
  getNumberOfSteps,
  getActiveStepNumber,
} from './stepUtils';

// events
import { signUpActiveStepChange } from '../events';

// i18n
import { useIntl } from 'utils/cl-intl';
import { MessageDescriptor } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled, { useTheme } from 'styled-components';

// typings
import { ISignUpInMetaData } from 'events/openSignUpInModal';
import { Multiloc } from 'typings';
import { IAppConfigurationData } from 'services/appConfiguration';
import { UserCustomFieldsInfos } from 'services/userCustomFields';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SignUpHelperText = styled(QuillEditedContent)`
  padding-bottom: 25px;
`;

export interface TSignUpStepsMap {
  'auth-providers': 'auth-providers';
  'password-signup': 'password-signup';
  'account-created': 'account-created';
  'custom-fields': 'custom-fields';
  confirmation: 'confirmation';
  success: 'success';
  verification: 'verification';
}

export type TSignUpStep = TSignUpStepsMap[keyof TSignUpStepsMap];

export interface ILocalState {
  emailSignUpSelected: boolean;
  accountCreated: boolean;
}

export type TSignUpStepConfigurationObject = {
  key: TSignUpStep;
  position: number;
  stepDescriptionMessage?: MessageDescriptor;
  helperText?: (
    tenant: IAppConfigurationData | undefined
  ) => Multiloc | null | undefined;
  isEnabled: (
    authUser: TAuthUser,
    metaData: ISignUpInMetaData,
    localState: ILocalState
  ) => boolean;
  isActive: (
    authUser: TAuthUser,
    metaData: ISignUpInMetaData,
    localState: ILocalState
  ) => boolean;
  canTriggerRegistration: boolean;
};

export type TSignUpConfiguration = {
  [key in TSignUpStep]?: TSignUpStepConfigurationObject;
};

export interface Props {
  metaData: ISignUpInMetaData;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
  fullScreen?: boolean;
}

interface InnerProps extends Props {
  userCustomFieldsSchema: UserCustomFieldsInfos;
}

const SignUp = ({
  metaData,
  onSignUpCompleted,
  onGoToSignIn,
  className,
  fullScreen,
  userCustomFieldsSchema,
}: InnerProps) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const theme = useTheme();
  const appConfig = useAppConfiguration();

  const modalContentRef = useRef<HTMLDivElement>(null);

  const userConfirmation = useFeatureFlag({
    name: 'user_confirmation',
  });

  const configuration = getDefaultSteps(userCustomFieldsSchema);
  const [emailSignUpSelected, setEmailSignUpSelected] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [activeStep, setActiveStep] = useState<TSignUpStep | null>(
    metaData.isInvitation ? 'password-signup' : 'auth-providers'
  );
  const [enabledSteps, setEnabledSteps] = useState<TSignUpStep[]>(
    getEnabledSteps(configuration, authUser, metaData, {
      emailSignUpSelected,
      accountCreated,
    })
  );
  const [error, setError] = useState<string>();
  const [headerHeight, setHeaderHeight] = useState<string>('100px');

  // this transitions the current step to the next step
  useEffect(() => {
    const nextActiveStep = getActiveStep(configuration, authUser, metaData, {
      emailSignUpSelected,
      accountCreated,
    });

    if (nextActiveStep === activeStep || !nextActiveStep) return;

    setActiveStep(nextActiveStep);

    setEnabledSteps(
      getEnabledSteps(configuration, authUser, metaData, {
        emailSignUpSelected,
        accountCreated,
      })
    );
  }, [
    configuration,
    authUser,
    metaData,
    emailSignUpSelected,
    accountCreated,
    activeStep,
  ]);

  // called when a step is completed
  const onCompleteActiveStep = useCallback(
    async (registrationData?: Record<string, any>) => {
      if (modalContentRef?.current) {
        modalContentRef.current.scrollTop = 0;
      }

      if (
        activeStep &&
        registrationCanBeCompleted(
          activeStep,
          configuration,
          authUser,
          metaData,
          { emailSignUpSelected, accountCreated }
        )
      ) {
        await completeRegistration(registrationData);
      }
    },
    [
      accountCreated,
      activeStep,
      authUser,
      configuration,
      emailSignUpSelected,
      metaData,
    ]
  );

  // this automatically completes the 'account-created' step (see stepUtils)
  useEffect(() => {
    if (activeStep === 'account-created') {
      onCompleteActiveStep();
      setAccountCreated(true);
    }
  }, [activeStep, onCompleteActiveStep]);

  const handleFlowCompleted = useCallback(() => {
    trackEventByName(tracks.signUpFlowCompleted);
    onSignUpCompleted();
  }, [onSignUpCompleted]);

  // emit event whenever activeStep changes
  useEffect(() => signUpActiveStepChange(activeStep), [activeStep]);

  useEffect(() => {
    if (metaData?.error) {
      setError(formatMessage(messages.somethingWentWrongText));
    }
  }, [metaData?.error, formatMessage]);

  const onResize = (_width, height) => {
    setHeaderHeight(`${Math.round(height) + 2}px`);
  };

  const handleSelectAuthProvider = (
    selectedAuthProvider: AuthProvider,
    setHrefFromModule?: () => void
  ) => {
    if (selectedAuthProvider === 'email') {
      setEmailSignUpSelected(true);
    } else {
      handleOnSSOClick(selectedAuthProvider, metaData, setHrefFromModule);
    }
  };

  const handleStepError = (errorMessage?: string) => {
    errorMessage
      ? setError(errorMessage)
      : setError(formatMessage(messages.somethingWentWrongText));
  };

  const handleGoBack = () => {
    setEmailSignUpSelected(false);
  };

  // variables
  const totalStepsCount = getNumberOfSteps(enabledSteps);
  const activeStepNumber = activeStep
    ? getActiveStepNumber(activeStep, enabledSteps)
    : null;
  const activeStepConfiguration = activeStep ? configuration[activeStep] : null;
  const helpText = activeStepConfiguration?.helperText?.(
    !isNilOrError(appConfig) ? appConfig : undefined
  );
  const stepDescription = activeStepConfiguration?.stepDescriptionMessage
    ? formatMessage(activeStepConfiguration.stepDescriptionMessage)
    : '';

  return (
    <Container id="e2e-sign-up-container" className={className ?? ''}>
      {activeStep !== 'success' && (
        <Header
          inModal={true}
          onResize={onResize}
          activeStepNumber={activeStepNumber}
          totalStepsCount={totalStepsCount}
          error={error}
          stepName={stepDescription}
        />
      )}

      <StyledModalContentContainer
        inModal={true}
        headerHeight={headerHeight}
        ref={modalContentRef}
        fullScreen={fullScreen}
      >
        {error &&
        (metaData?.error ? metaData?.error?.code === 'general' : true) ? (
          <Error text={error} animate={false} marginBottom="30px" />
        ) : (
          <>
            {helpText && (
              <SignUpHelperText
                textColor={theme.colors.tenantText}
                fontSize="base"
                fontWeight={300}
              >
                <T value={helpText} supportHtml />
              </SignUpHelperText>
            )}

            {activeStep === 'auth-providers' && (
              <AuthProviders
                metaData={metaData}
                onAuthProviderSelected={handleSelectAuthProvider}
                goToOtherFlow={onGoToSignIn}
              />
            )}

            {activeStep === 'password-signup' && (
              <PasswordSignup
                metaData={metaData}
                loading={activeStepNumber === null}
                hasNextStep={
                  activeStepNumber ? activeStepNumber < totalStepsCount : false
                }
                onGoToSignIn={onGoToSignIn}
                onGoBack={handleGoBack}
                onError={handleStepError}
                onCompleted={onCompleteActiveStep}
              />
            )}

            {activeStep === 'confirmation' && userConfirmation && (
              <ConfirmationSignupStep onCompleted={onCompleteActiveStep} />
            )}

            {activeStep === 'verification' && (
              <VerificationSignUpStep
                metaData={metaData}
                onError={handleStepError}
                onSkipped={onCompleteActiveStep}
                onCompleted={onCompleteActiveStep}
              />
            )}

            {activeStep === 'custom-fields' && (
              <CustomFieldsSignupStep onCompleted={onCompleteActiveStep} />
            )}

            {activeStep === 'success' && (
              <Success onClose={handleFlowCompleted} />
            )}
          </>
        )}
      </StyledModalContentContainer>
    </Container>
  );
};

const Wrapper = (props: Props) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();
  if (isNilOrError(userCustomFieldsSchema)) return null;

  return <SignUp {...props} userCustomFieldsSchema={userCustomFieldsSchema} />;
};

export default Wrapper;
