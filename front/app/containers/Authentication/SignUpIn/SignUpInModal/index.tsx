import React, { memo, useState, useEffect, useCallback } from 'react';
import tracks from './tracks';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SignIn from './SignIn';
import SignUp, { TSignUpStep } from './SignUp';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';

// events
import { signUpActiveStepChange$ } from './events';
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

interface Props {
  metaData?: any;
  className?: string;
  onClosed: () => void;
  onOpened?: (opened: boolean) => void;
  fullScreenModal?: boolean;
}

const SignUpInModal = memo<Props>(
  ({ metaData, className, onClosed, onOpened, fullScreenModal }) => {
    const [signUpActiveStep, setSignUpActiveStep] = useState<
      TSignUpStep | null | undefined
    >(undefined);

    const authUser = useAuthUser();
    const participationConditions = useParticipationConditions(
      metaData?.context ?? null
    );

    const isSmallerThanPhone = useBreakpoint('phone');

    const opened = !!metaData;

    const hasParticipationConditions =
      !isNilOrError(participationConditions) &&
      participationConditions.length > 0;

    const modalWidth =
      signUpActiveStep === 'verification' && hasParticipationConditions
        ? 820
        : 580;

    useEffect(() => {
      if (onOpened) {
        onOpened(opened);
      }
    }, [opened, onOpened]);

    useEffect(() => {
      const subscription = signUpActiveStepChange$.subscribe(
        ({ eventValue: activeStep }) => {
          setSignUpActiveStep(activeStep);
        }
      );

      return () => subscription.unsubscribe();
    }, [authUser]);

    const onClose = async () => {
      const signedUpButNotCompleted =
        !isNilOrError(authUser) &&
        !authUser.attributes.registration_completed_at;

      if (signedUpButNotCompleted) {
        // We still want to track users who exit at email verification, but we do not sign them out.
        trackEventByName(tracks.signUpFlowExitedAtEmailVerificationStep);
      }

      onClosed();
    };

    const onSignUpInCompleted = () => {
      onClosed();

      const requiresVerification = !!metaData?.verification;

      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

      if (!requiresVerification || authUserIsVerified) {
        if (metaData?.successAction) {
          triggerSuccessAction(metaData.successAction);
        }
      }
    };

    const onToggleSelectedMethod = useCallback(() => {
      if (!metaData) return;
    }, [metaData]);

    return (
      <Modal
        fullScreen={fullScreenModal}
        zIndex={fullScreenModal ? 400 : 10000001}
        width={modalWidth}
        padding="0px"
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
      >
        <Box
          id="e2e-sign-up-in-modal"
          className={className}
          width={isSmallerThanPhone ? undefined : `${modalWidth}px`}
          background="white"
        >
          {opened && metaData && (
            <Box>
              {metaData.flow === 'signup' ? (
                <SignUp
                  metaData={metaData}
                  onSignUpCompleted={onSignUpInCompleted}
                  onGoToSignIn={onToggleSelectedMethod}
                  fullScreen={fullScreenModal}
                />
              ) : (
                <SignIn
                  metaData={metaData}
                  onSignInCompleted={onSignUpInCompleted}
                  onGoToSignUp={onToggleSelectedMethod}
                  fullScreen={fullScreenModal}
                />
              )}
            </Box>
          )}
        </Box>
      </Modal>
    );
  }
);

export default SignUpInModal;
