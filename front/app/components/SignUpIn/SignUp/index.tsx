import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';

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

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';

// utils
import { isNilOrError, isUndefinedOrError } from 'utils/helperUtils';
import {
  getDefaultSteps,
  getNextStep,
  getEnabledSteps,
  getNumberOfSteps,
} from './stepUtils';

// events
import { signUpActiveStepChange } from 'components/SignUpIn/events';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/SignUpIn/tracks';

// style
import styled, { withTheme } from 'styled-components';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';
import { Multiloc } from 'typings';
import { IUserData } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';

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
  success: 'success';
}

export type TSignUpStep = TSignUpStepsMap[keyof TSignUpStepsMap];

export type TSignUpStepConfigurationObject = {
  position: number;
  stepName?: string;
  helperText?: (
    tenant: IAppConfigurationData | undefined
  ) => Multiloc | null | undefined;
  isEnabled: (metaData: ISignUpInMetaData) => boolean;
  isActive: (authUser: IUserData | undefined) => boolean;
};

export type TSignUpStepConfiguration = {
  [key in TSignUpStep]?: TSignUpStepConfigurationObject;
};

export interface InputProps {
  metaData: ISignUpInMetaData;
  windowHeight: number;
  customHeader?: JSX.Element;
  onSignUpCompleted: () => void;
  onGoToSignIn: () => void;
  className?: string;
}

interface Props extends InputProps {
  theme: any;
}

const SignUp: FC<Props & InjectedIntlProps> = memo(
  ({
    intl: { formatMessage },
    metaData,
    onSignUpCompleted,
    onGoToSignIn,
    className,
    theme,
    windowHeight,
  }) => {
    const authUser = useAuthUser();
    const tenant = useAppConfiguration();

    const modalContentRef = useRef<HTMLDivElement>(null);

    // activeStepRef and authUserRef are used in getNextStep
    // because activeStep and authUser are out-of-sync there
    const activeStepRef = useRef<TSignUpStep | null>(null);
    const authUserRef = useRef<TAuthUser>(authUser);

    const [configuration, setConfiguration] = useState<
      TSignUpStepConfiguration
    >(getDefaultSteps(formatMessage));

    const enabledSteps = useMemo<TSignUpStep[]>(() => {
      return getEnabledSteps(configuration, metaData);
    }, [configuration, metaData]);

    const [error, setError] = useState<string>();
    const [activeStep, setActiveStep] = useState<TSignUpStep | null>(null);
    const [headerHeight, setHeaderHeight] = useState<string>('100px');

    const activeStepConfiguration = useMemo<
      TSignUpStepConfigurationObject | undefined
    >(() => configuration?.[activeStep || ''], [activeStep, configuration]);

    const goToNextStep = async (registrationData?: Record<string, any>) => {
      if (modalContentRef?.current) {
        modalContentRef.current.scrollTop = 0;
      }

      const nextStep = getNextStep(
        authUserRef,
        activeStepRef,
        enabledSteps,
        configuration
      );

      if (nextStep === 'success') {
        await completeRegistration(registrationData);
      }

      if (!nextStep) {
        handleFlowCompleted();
        return;
      }

      setActiveStep(nextStep);
    };

    const onResize = (_width, height) => {
      setHeaderHeight(`${Math.round(height) + 2}px`);
    };

    const handleSelectAuthProvider = (selectedAuthProvider: AuthProvider) => {
      if (selectedAuthProvider === 'email') {
        goToNextStep();
      } else {
        handleOnSSOClick(selectedAuthProvider, metaData);
      }
    };

    const handleStepError = () => {
      setError(formatMessage(messages.somethingWentWrongText));
    };

    const handleFlowCompleted = () => {
      trackEventByName(tracks.signUpFlowCompleted);
      onSignUpCompleted();
    };

    const handleOnOutletData = ({ key, configuration }) => {
      setConfiguration((oldConfiguration) => ({
        ...oldConfiguration,
        [key]: configuration,
      }));
    };

    const handleGoBack = () => {
      setActiveStep('auth-providers');
    };

    // update authUserRef whenever authUser changes
    useEffect(() => {
      authUserRef.current = authUser;
    }, [authUser]);

    // update activeStepRef whenever activeStep changes
    useEffect(() => {
      activeStepRef.current = activeStep;
    }, [activeStep]);

    // this is needed to deal with the scenario in which
    // a user gets sent to an external page (e.g. for sso or verification),
    // and afterwards back to the platform to complete their registration.
    // if the activeStep has not been set yet, but the authUser is either null or an object
    // we request the next step in the registration process and set it if there's a step remaining
    if (activeStep === null && !isUndefinedOrError(authUserRef.current)) {
      const nextStep = getNextStep(
        authUserRef,
        activeStepRef,
        enabledSteps,
        configuration
      );

      if (nextStep) {
        setActiveStep(nextStep);
      }
    }

    useEffect(() => {
      trackEventByName(tracks.signUpFlowEntered);

      if (metaData?.token) {
        request(
          `${API_PATH}/users/by_invite/${metaData.token}`,
          null,
          { method: 'GET' },
          null
        ).catch(() => {
          setError(formatMessage(messages.invitationError));
        });
      }
      return () => {
        trackEventByName(tracks.signUpFlowExited);
        signUpActiveStepChange(undefined);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // emit event whenever activeStep changes
    useEffect(() => signUpActiveStepChange(activeStep), [activeStep]);

    useEffect(() => {
      if (metaData?.error) {
        setError(formatMessage(messages.somethingWentWrongText));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metaData?.error]);

    const helpText = activeStepConfiguration?.helperText?.(
      !isNilOrError(tenant) ? tenant.data : undefined
    );

    const stepName = activeStepConfiguration?.stepName ?? '';

    const [activeStepNumber, totalStepsCount] = useMemo(() => {
      return getNumberOfSteps(
        enabledSteps,
        configuration,
        activeStepConfiguration
      );
    }, [configuration, enabledSteps, activeStep, activeStepConfiguration]);

    return (
      <Container id="e2e-sign-up-container" className={className ?? ''}>
        {activeStep !== 'success' && (
          <Header
            inModal={metaData.inModal}
            onResize={onResize}
            activeStepNumber={activeStepNumber}
            totalStepsCount={totalStepsCount}
            error={error}
            stepName={stepName}
          />
        )}

        <StyledModalContentContainer
          inModal={!!metaData.inModal}
          windowHeight={`${windowHeight}px`}
          headerHeight={headerHeight}
          ref={modalContentRef}
        >
          {error ? (
            <Error text={error} animate={false} marginBottom="30px" />
          ) : (
            <>
              {helpText && (
                <SignUpHelperText
                  textColor={theme.colorText}
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
                  hasNextStep={activeStepNumber < totalStepsCount}
                  onGoToSignIn={onGoToSignIn}
                  onGoBack={handleGoBack}
                  onCompleted={goToNextStep}
                />
              )}

              <Outlet
                id="app.components.SignUpIn.SignUp.step"
                step={activeStep}
                metaData={metaData}
                onData={handleOnOutletData}
                onError={handleStepError}
                onSkipped={goToNextStep}
                onCompleted={goToNextStep}
              />

              {activeStep === 'success' && (
                <Success onClose={handleFlowCompleted} />
              )}
            </>
          )}
        </StyledModalContentContainer>
      </Container>
    );
  }
);

const SignUpWithHoC = injectIntl(withTheme(SignUp));

export default SignUpWithHoC;
