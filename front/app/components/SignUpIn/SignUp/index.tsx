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
import { isNilOrError } from 'utils/helperUtils';
import {
  getDefaultSteps,
  getActiveStep,
  getEnabledSteps,
  allStepsCompleted,
  allRequiredStepsCompleted,
  getNumberOfSteps,
  getActiveStepNumber,
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

export interface ILocalState {
  emailSignUpSelected: boolean | null;
}

export type TSignUpStepConfigurationObject = {
  key: TSignUpStep;
  position: number;
  stepName?: string;
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
};

export type TSignUpConfiguration = {
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

    const [configuration, setConfiguration] = useState<TSignUpConfiguration>(
      getDefaultSteps(formatMessage)
    );

    const [emailSignUpSelected, setEmailSignUpSelected] = useState<
      boolean | null
    >(null);

    const activeStep = useMemo<TSignUpStep>(
      () =>
        getActiveStep(configuration, authUser, metaData, {
          emailSignUpSelected,
        }),
      [configuration, authUser, metaData, emailSignUpSelected]
    );

    const enabledSteps = useMemo<TSignUpStep[]>(
      () =>
        getEnabledSteps(configuration, authUser, metaData, {
          emailSignUpSelected,
        }),
      [configuration, authUser, metaData, emailSignUpSelected]
    );

    const [error, setError] = useState<string>();
    const [headerHeight, setHeaderHeight] = useState<string>('100px');

    const activeStepConfiguration = useMemo<
      TSignUpStepConfigurationObject | undefined
    >(() => configuration?.[activeStep || ''], [activeStep, configuration]);

    const goToNextStep = async (registrationData?: Record<string, any>) => {
      if (modalContentRef?.current) {
        modalContentRef.current.scrollTop = 0;
      }

      if (allRequiredStepsCompleted(activeStep, enabledSteps)) {
        await completeRegistration(registrationData);
      }

      if (allStepsCompleted(activeStep, enabledSteps)) {
        handleFlowCompleted();
        return;
      }
    };

    const onResize = (_width, height) => {
      setHeaderHeight(`${Math.round(height) + 2}px`);
    };

    const handleSelectAuthProvider = (selectedAuthProvider: AuthProvider) => {
      if (selectedAuthProvider === 'email') {
        setEmailSignUpSelected(false);
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
      setEmailSignUpSelected(false);
    };

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
    const totalStepsCount = getNumberOfSteps(enabledSteps);
    const activeStepNumber = getActiveStepNumber(activeStep, enabledSteps);

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
