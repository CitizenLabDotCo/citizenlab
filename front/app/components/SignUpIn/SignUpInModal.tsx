import React, { memo, useState, useEffect } from 'react';
import { signOut } from 'services/auth';
import tracks from './tracks';

// components
import Modal from 'components/UI/Modal';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpStep } from 'components/SignUpIn/SignUp';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';
import useParticipationConditions from 'hooks/useParticipationConditions';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';

// events
import {
  closeSignUpInModal,
  openSignUpInModal$,
  signUpActiveStepChange$,
} from 'components/SignUpIn/events';

// style
import { Box } from '@citizenlab/cl2-component-library';
interface Props {
  className?: string;
  onMounted?: () => void;
  onClosed: () => void;
  onOpened?: (opened: boolean) => void;
  fullScreenModal?: boolean;
}

const SignUpInModal = memo<Props>(
  ({ className, onMounted, onClosed, onOpened, fullScreenModal }) => {
    const isMounted = useIsMounted();
    const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(
      undefined
    );
    const [signUpActiveStep, setSignUpActiveStep] = useState<
      TSignUpStep | null | undefined
    >(undefined);

    const authUser = useAuthUser();
    const participationConditions = useParticipationConditions(
      metaData?.verificationContext
    );

    const opened = !!metaData?.inModal;

    const hasParticipationConditions =
      !isNilOrError(participationConditions) &&
      participationConditions.length > 0;

    const modalWidth =
      signUpActiveStep === 'verification' && hasParticipationConditions
        ? 820
        : 580;

    useEffect(() => {
      if (isMounted()) {
        onMounted?.();
      }
    }, [onMounted, isMounted]);

    useEffect(() => {
      if (onOpened) {
        onOpened(opened);
      }
    }, [opened, onOpened]);

    useEffect(() => {
      const subscriptions = [
        openSignUpInModal$.subscribe(({ eventValue: newMetaData }) => {
          setMetaData(newMetaData);
        }),
        signUpActiveStepChange$.subscribe(({ eventValue: activeStep }) => {
          setSignUpActiveStep(activeStep);
        }),
      ];

      return () =>
        subscriptions.forEach((subscription) => subscription.unsubscribe());
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

    return (
      <Modal
        fullScreen={fullScreenModal}
        width={modalWidth}
        padding="0px"
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
      >
        <Box id="e2e-sign-up-in-modal" className={className} zIndex="1000">
          {opened && metaData && (
            <SignUpIn
              metaData={metaData}
              onSignUpInCompleted={onSignUpInCompleted}
              fullScreen={fullScreenModal}
            />
          )}
        </Box>
      </Modal>
    );
  }
);

export default SignUpInModal;
