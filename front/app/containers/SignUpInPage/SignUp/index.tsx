import React, { useCallback, useEffect, useRef, useState } from 'react';
// services
import { handleOnSSOClick } from 'services/singleSignOn';
import { completeRegistration } from 'services/users';

// components
import Header from './Header';
import AuthProviders, { AuthProvider } from '../AuthProviders';
import PasswordSignup from '../SignUp/PasswordSignup';
import Success from '../SignUp/Success';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Outlet from 'components/Outlet';
import Mounter from 'components/Mounter';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';

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
import { useTheme } from 'styled-components';

// typings
import { ISignUpInMetaData } from '../SignUpIn';
import { Multiloc } from 'typings';
import { IAppConfigurationData } from 'services/appConfiguration';

export interface TSignUpStepsMap {
  'auth-providers': 'auth-providers';
  'password-signup': 'password-signup';
  'account-created': 'account-created';
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
    tenant: IAppConfigurationData | null
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
}

const SignUp = ({ metaData, onSignUpCompleted, onGoToSignIn }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const tenant = useAppConfiguration();
  const theme: any = useTheme();
  const modalContentRef = useRef<HTMLDivElement>(null);

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
  const [error, setError] = useState<string | null>(null);

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
    !isNilOrError(tenant) ? tenant : null
  );
  const stepDescription = activeStepConfiguration?.stepDescriptionMessage
    ? formatMessage(activeStepConfiguration.stepDescriptionMessage)
    : '';

  return (
    <Box id="e2e-sign-up-container">
      {activeStep !== 'success' && (
        <Header
          inModal={metaData.inModal}
          activeStepNumber={activeStepNumber}
          totalStepsCount={totalStepsCount}
          error={error}
          stepName={stepDescription}
        />
      )}

      <Box ref={modalContentRef}>
        {error ? (
          <Error text={error} animate={false} marginBottom="30px" />
        ) : (
          <>
            {helpText && (
              <Box pb="25px">
                <QuillEditedContent
                  textColor={theme.colors.tenantText}
                  fontSize="base"
                  fontWeight={300}
                >
                  <T value={helpText} supportHtml />
                </QuillEditedContent>
              </Box>
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
      </Box>
    </Box>
  );
};
export default SignUp;
