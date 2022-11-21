import React, { useCallback, useEffect, useRef, useState } from 'react';
// services
import { handleOnSSOClick } from 'services/singleSignOn';
import { completeRegistration } from 'services/users';

// components
import Header from './Header';
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import PasswordSignup from 'components/SignUpIn/SignUp/PasswordSignup';
import Success from 'components/SignUpIn/SignUp/Success';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { StyledModalContentContainer } from 'components/SignUpIn/styles';
import Outlet from 'components/Outlet';
import Mounter from 'components/Mounter';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';
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
  allDataLoaded,
} from './stepUtils';

// events
import { signUpActiveStepChange } from 'components/SignUpIn/events';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { MessageDescriptor, WrappedComponentProps } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/SignUpIn/tracks';

// style
import styled, { useTheme } from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';
import { Multiloc } from 'typings';
import { IAppConfigurationData } from 'services/appConfiguration';
import ConfirmationSignupStep from './ConfirmationSignupStep';

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
  confirmation: 'confirmation';
  success: 'success';
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

export type TDataLoadedPerOutlet = {
  [key in TSignUpStep]?: boolean;
};

export interface Props {
  metaData: ISignUpInMetaData;
  customHeader?: JSX.Element;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
  fullScreen?: boolean;
}

const SignUp = ({
  intl: { formatMessage },
  metaData,
  onSignUpCompleted,
  onGoToSignIn,
  className,
  fullScreen,
}: Props & WrappedComponentProps) => {
  const authUser = useAuthUser();
  const tenant = useAppConfiguration();
  const theme: any = useTheme();

  const modalContentRef = useRef<HTMLDivElement>(null);

  const userConfirmation = useFeatureFlag({
    name: 'user_confirmation',
  });

  // state
  const [configuration, setConfiguration] = useState<TSignUpConfiguration>(
    getDefaultSteps()
  );
  const [outletsRendered, setOutletsRendered] = useState(false);
  const [dataLoadedPerOutlet, setDataLoadedPerOutlet] =
    useState<TDataLoadedPerOutlet>({});
  const [emailSignUpSelected, setEmailSignUpSelected] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const confirmOutletsRendered = () => setOutletsRendered(true);
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
    if (!outletsRendered) return;
    if (!allDataLoaded(dataLoadedPerOutlet)) return;

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
    outletsRendered,
    dataLoadedPerOutlet,
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

  // this makes sure that if registration is completed,
  // but we're not in a modal, handleFlowCompleted is
  // still called even without closing the Success window
  useEffect(() => {
    if (
      !isNilOrError(authUser) &&
      !!authUser.attributes.registration_completed_at &&
      !metaData.inModal
    ) {
      handleFlowCompleted();
    }
  }, [authUser, metaData, handleFlowCompleted]);

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

  const handleOnOutletData = (
    configuration: TSignUpStepConfigurationObject
  ) => {
    setConfiguration((oldConfiguration) => ({
      ...oldConfiguration,
      [configuration.key]: configuration,
    }));
  };

  const handleOnOutletDataLoaded = (step: TSignUpStep, loaded: boolean) => {
    setDataLoadedPerOutlet((oldDataLoadedPerOutlet) => ({
      ...oldDataLoadedPerOutlet,
      [step]: loaded,
    }));
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
    !isNilOrError(tenant) ? tenant : undefined
  );
  const stepDescription = activeStepConfiguration?.stepDescriptionMessage
    ? formatMessage(activeStepConfiguration.stepDescriptionMessage)
    : '';

  return (
    <Container id="e2e-sign-up-container" className={className ?? ''}>
      {activeStep !== 'success' && (
        <Header
          inModal={metaData.inModal}
          onResize={onResize}
          activeStepNumber={activeStepNumber}
          totalStepsCount={totalStepsCount}
          error={error}
          stepName={stepDescription}
        />
      )}

      <StyledModalContentContainer
        inModal={!!metaData.inModal}
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
              <ConfirmationSignupStep
                step={activeStep}
                onData={handleOnOutletData}
                onCompleted={onCompleteActiveStep}
              />
            )}

            <Outlet
              id="app.components.SignUpIn.SignUp.step"
              step={activeStep}
              metaData={metaData}
              onData={handleOnOutletData}
              onDataLoaded={handleOnOutletDataLoaded}
              onError={handleStepError}
              onSkipped={onCompleteActiveStep}
              onCompleted={onCompleteActiveStep}
            />

            <Mounter onMount={confirmOutletsRendered} />

            {activeStep === 'success' && (
              <Success onClose={handleFlowCompleted} />
            )}
          </>
        )}
      </StyledModalContentContainer>
    </Container>
  );
};
export default injectIntl(SignUp);
