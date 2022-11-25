import React, { memo, useState, useEffect, useCallback } from 'react';
import { signOut } from 'services/auth';
import tracks from './tracks';

// components
import { Box } from '@citizenlab/cl2-component-library';
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
import { closeSignUpInModal, signUpActiveStepChange$ } from './events';
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';

// typings
import { TSignUpInFlow } from './typings';

interface Props {
  metaData?: ISignUpInMetaData;
  className?: string;
  onClosed: () => void;
  onOpened?: (opened: boolean) => void;
  fullScreenModal?: boolean;
}

function getNewFlow(flow: TSignUpInFlow) {
  switch (flow) {
    case 'signup':
      return 'signin';
    case 'signin':
      return 'signup';
  }
}

const SignUpInModal = memo<Props>(
  ({ metaData, className, onClosed, onOpened, fullScreenModal }) => {
    const [signUpActiveStep, setSignUpActiveStep] = useState<
      TSignUpStep | null | undefined
    >(undefined);

    const authUser = useAuthUser();
    const participationConditions = useParticipationConditions(
      metaData?.verificationContext
    );

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
        // We need to await signOut. If authUser would be there
        // when we call closeSignUpModal,
        // it would cause openSignUpInModalIfNecessary in App/index.tsx to open the modal again.
        // This happens because the user is indeed not completely registered/verified
        // (see openSignUpInModalIfNecessary).
        await signOut();
        trackEventByName(tracks.signUpFlowExitedAtEmailVerificationStep);
      }

      onClosed();

      closeSignUpInModal();
    };

    const onSignUpInCompleted = () => {
      closeSignUpInModal();
      onClosed();

      const requiresVerification = !!metaData?.verification;

      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

      // Temporary fix for CL-355 given urgency
      if (metaData?.pathname.includes('projects/')) {
        location.reload();
      }
      // Temporary fix end

      if (!requiresVerification || authUserIsVerified) {
        metaData?.action?.();
      }
    };

    const onToggleSelectedMethod = useCallback(() => {
      if (!metaData) return;

      const flow = getNewFlow(metaData.flow);
      openSignUpInModal({
        ...metaData,
        flow,
      });
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
          width={`${modalWidth}px`}
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
