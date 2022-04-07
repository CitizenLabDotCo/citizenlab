import React, { memo, useState, useEffect } from 'react';
import { signOutAndDeleteAccount } from 'services/auth';

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

// events
import {
  closeSignUpInModal,
  openSignUpInModal$,
  signUpActiveStepChange$,
} from 'components/SignUpIn/events';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  className?: string;
  onMounted?: () => void;
  onDeclineInvitation?: () => void;
}

const SignUpInModal = memo<Props>(
  ({ className, onMounted, onDeclineInvitation }) => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onMounted]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    const onClose = () => {
      closeSignUpInModal();

      const signedUpButNotCompleted =
        !isNilOrError(authUser) &&
        !authUser.attributes.registration_completed_at;
      if (signedUpButNotCompleted) {
        signOutAndDeleteAccount();
      }

      if (onDeclineInvitation && metaData?.isInvitation) {
        onDeclineInvitation();
      }
    };

    const onSignUpInCompleted = () => {
      closeSignUpInModal();
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
        width={modalWidth}
        padding="0px"
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
      >
        <Container id="e2e-sign-up-in-modal" className={className}>
          {opened && metaData && (
            <SignUpIn
              metaData={metaData}
              onSignUpInCompleted={onSignUpInCompleted}
            />
          )}
        </Container>
      </Modal>
    );
  }
);

export default SignUpInModal;
