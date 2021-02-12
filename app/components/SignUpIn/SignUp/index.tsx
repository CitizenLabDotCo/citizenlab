import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { indexOf } from 'lodash-es';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';

// components
import AuthProviders, { AuthProvider } from 'components/SignUpIn/AuthProviders';
import PasswordSignup from 'components/SignUpIn/SignUp/PasswordSignup';
import VerificationSteps from 'components/Verification/VerificationSteps';
import Success from 'components/SignUpIn/SignUp/Success';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
  StyledModalContentContainer,
} from 'components/SignUpIn/styles';
import ReactResizeDetector from 'react-resize-detector';
import Outlet from 'components/Outlet';

// utils
import { isNilOrError } from 'utils/helperUtils';
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
import styled, { withTheme } from 'styled-components';
import { HeaderSubtitle } from 'components/UI/Modal';

// typings
import { ISignUpInMetaData } from 'components/SignUpIn';
import { Multiloc } from 'typings';
import useAuthUser from 'hooks/useAuthUser';

import { IUserData } from 'services/users';

import useAppConfiguration from 'hooks/useAppConfiguration';
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
  verification: 'verification';
  success: 'success';
}

export type TSignUpSteps = TSignUpStepsMap[keyof TSignUpStepsMap];

export type TSignUpStepConfigurationObject = {
  position: number;
  stepName?: string;
  helperText?: (
    tenant: IAppConfigurationData | undefined
  ) => Multiloc | null | undefined;
  onCompleted?: () => void;
  onSkipped?: () => void;
  onError?: () => void;
  onSelected?: (data: unknown) => void;
  isEnabled: (metaData: ISignUpInMetaData) => boolean;
  isActive: (authUser: IUserData | undefined) => boolean;
};

export type TSignUpStepConfiguration = {
  [key in TSignUpSteps]?: TSignUpStepConfigurationObject;
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

    const [configuration, setConfiguration] = useState<
      TSignUpStepConfiguration
    >({
      'auth-providers': {
        position: 1,
        stepName: formatMessage(messages.createYourAccount),
        helperText: (tenant) =>
          tenant?.attributes?.settings?.core?.signup_helper_text,
        onSelected: (selectedAuthProvider: AuthProvider) => {
          if (selectedAuthProvider === 'email') {
            goToNextStep();
          } else {
            handleOnSSOClick(selectedAuthProvider, metaData);
          }
        },
        isEnabled: (metaData) => !metaData?.isInvitation,
        isActive: (authUser) => !authUser,
      },
      'password-signup': {
        position: 2,
        stepName: formatMessage(messages.createYourAccount),
        helperText: (tenant) =>
          tenant?.attributes?.settings?.core?.signup_helper_text,
        isEnabled: () => true,
        isActive: (authUser) => !authUser,
      },
      verification: {
        position: 3,
        stepName: formatMessage(messages.verifyYourIdentity),
        onSkipped: () => trackEventByName(tracks.signUpVerificationStepSkipped),
        onError: () => trackEventByName(tracks.signUpVerificationStepFailed),
        onCompleted: () =>
          trackEventByName(tracks.signUpVerificationStepCompleted),
        isEnabled: (metaData) => !!metaData?.verification,
        isActive: (authUser) => !authUser?.attributes?.verified,
      },
      success: {
        position: 5,
        isEnabled: (metaData) => !!metaData?.inModal,
        isActive: (authUser) =>
          !!authUser?.attributes?.registration_completed_at,
      },
    });

    const enabledSteps = useMemo<TSignUpSteps[]>(
      () =>
        Object.entries(configuration)
          .reduce(
            (
              acc,
              [key, configuration]: [
                TSignUpSteps,
                TSignUpStepConfigurationObject
              ]
            ) => {
              if (!configuration.isEnabled(metaData)) return acc;
              return [...acc, { id: key, position: configuration.position }];
            },
            []
          )
          .sort((a, b) => a.position - b.position)
          .map(({ id }) => id),
      [configuration, metaData]
    );

    const [error, setError] = useState<string>();
    const [activeStep, setActiveStep] = useState<TSignUpSteps>(enabledSteps[0]);
    const [headerHeight, setHeaderHeight] = useState<string>('100px');

    const activeStepConfiguration = useMemo<
      TSignUpStepConfigurationObject | undefined
    >(() => configuration?.[activeStep], [activeStep, configuration]);

    const getNextStep = () => {
      const step = enabledSteps[indexOf(enabledSteps, activeStep) + 1];
      if (!step) return undefined;
      const isActive = configuration?.[step]?.isActive?.(
        !isNilOrError(authUser) ? authUser : undefined
      );
      return isActive ? step : undefined;
    };

    const goToNextStep = () => {
      if (modalContentRef?.current) {
        modalContentRef.current.scrollTop = 0;
      }

      const nextStep = getNextStep();
      if (!nextStep) {
        handleFlowCompleted();
        return;
      }
      setActiveStep(nextStep);
    };

    const onResize = (_width, height) =>
      setHeaderHeight(`${Math.round(height) + 2}px`);

    const handleStepCompleted = () => {
      configuration?.[activeStep]?.onCompleted?.();
      goToNextStep();
    };

    const handleStepSkipped = () => {
      configuration?.[activeStep]?.onSkipped?.();
      goToNextStep();
    };

    const handleStepError = () => {
      configuration?.[activeStep]?.onError?.();
      setError(formatMessage(messages.somethingWentWrongText));
    };

    const handleSelectedInStep = (data: unknown) => {
      configuration?.[activeStep]?.onSelected?.(data);
    };

    const handleFlowCompleted = () => {
      trackEventByName(tracks.signUpFlowCompleted);
      onSignUpCompleted();
    };

    const handleOnOutletData = ({ key, configuration }) =>
      setConfiguration((oldConfiguration) => ({
        ...oldConfiguration,
        [key]: configuration,
      }));

    const handleGoBack = () => setActiveStep('auth-providers');

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
    }, []);

    useEffect(() => signUpActiveStepChange(activeStep), [activeStep]);
    useEffect(() => {
      if (metaData?.error) {
        setError(formatMessage(messages.somethingWentWrongText));
      }
    }, [metaData?.error]);

    const helpText = activeStepConfiguration?.helperText?.(
      !isNilOrError(tenant) ? tenant.data : undefined
    );
    const stepName = activeStepConfiguration?.stepName ?? '';

    const [activeStepNumber, totalStepsCount] = useMemo(() => {
      // base the steps on the stepName (grouping)
      const uniqueSteps = [
        ...new Set(
          enabledSteps
            .map((step: TSignUpSteps) => configuration?.[step]?.stepName)
            .filter((v) => v !== undefined)
        ),
      ];
      return [
        indexOf(uniqueSteps, activeStepConfiguration?.stepName) > -1
          ? indexOf(uniqueSteps, activeStepConfiguration?.stepName) + 1
          : 1,
        uniqueSteps.length,
      ];
    }, [configuration, enabledSteps, activeStep, activeStepConfiguration]);

    return (
      <Container id="e2e-sign-up-container" className={className ?? ''}>
        {activeStep !== 'success' && (
          <div>
            <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
              <div>
                <StyledHeaderContainer inModal={!!metaData.inModal}>
                  <StyledHeaderTitle inModal={!!metaData.inModal}>
                    <FormattedMessage {...messages.signUp2} />
                  </StyledHeaderTitle>

                  {!error && stepName && (
                    <HeaderSubtitle>
                      {totalStepsCount > 1 ? (
                        <FormattedMessage
                          {...messages.headerSubtitle}
                          values={{
                            activeStepNumber,
                            stepName,
                            totalStepsCount,
                          }}
                        />
                      ) : (
                        stepName
                      )}
                    </HeaderSubtitle>
                  )}
                </StyledHeaderContainer>
              </div>
            </ReactResizeDetector>
          </div>
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
                  onAuthProviderSelected={handleSelectedInStep}
                  goToOtherFlow={onGoToSignIn}
                />
              )}

              {activeStep === 'password-signup' && (
                <PasswordSignup
                  metaData={metaData}
                  hasNextStep={enabledSteps.length > 1}
                  onCompleted={handleStepCompleted}
                  onGoToSignIn={onGoToSignIn}
                  onGoBack={handleGoBack}
                />
              )}

              {activeStep === 'verification' && (
                <VerificationSteps
                  context={metaData?.verificationContext || null}
                  initialActiveStep="method-selection"
                  inModal={!!metaData.inModal}
                  showHeader={false}
                  skippable={true}
                  onCompleted={handleStepCompleted}
                  onSkipped={handleStepSkipped}
                  onError={handleStepError}
                />
              )}

              <Outlet
                id="app.components.SignUpIn.SignUp.step"
                step={activeStep}
                onData={handleOnOutletData}
                onCompleted={handleStepCompleted}
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
