import React, { useState, useEffect } from 'react';
import { signOut } from 'services/auth';
import tracks from './tracks';

// components
import Modal from 'components/UI/Modal';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpStep } from 'components/SignUpIn/SignUp';
import FullscreenModal from 'components/UI/FullscreenModal';
import { Box, Button } from '@citizenlab/cl2-component-library';
import PlatformFooter from 'containers/PlatformFooter';

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
import styled from 'styled-components';

const Container = styled.div``;

const StyledSignUpIn = styled(SignUpIn)`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  width: 580px;
`;

const StyledButton = styled(Button)`
  display: inline-flex;
`;

interface Props {
  className?: string;
  onMounted?: () => void;
  onDeclineInvitation?: () => void;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
}

const SignUpInModal = ({
  className,
  onMounted,
  onDeclineInvitation,
  navbarRef,
  mobileNavbarRef,
}: Props) => {
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
      !isNilOrError(authUser) && !authUser.attributes.registration_completed_at;

    if (signedUpButNotCompleted) {
      // We need to await signOut. If authUser would be there
      // when we call closeSignUpModal,
      // it would cause openSignUpInModalIfNecessary in App/index.tsx to open the modal again.
      // This happens because the user is indeed not completely registered/verified
      // (see openSignUpInModalIfNecessary).
      await signOut();
      trackEventByName(tracks.signUpFlowExitedAtEmailVerificationStep);
    }

    if (onDeclineInvitation && metaData?.isInvitation) {
      onDeclineInvitation();
    }

    closeSignUpInModal();
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

  // to be changed, temporary value
  const franceConnectEnabled = false;

  return (
    <>
      {franceConnectEnabled ? (
        <Modal
          width={modalWidth}
          padding="0px"
          opened={opened}
          close={onClose}
          closeOnClickOutside={false}
        >
          <Container id="e2e-sign-up-in-modal" className={className}>
            {metaData && (
              <SignUpIn
                metaData={metaData}
                onSignUpInCompleted={onSignUpInCompleted}
              />
            )}
          </Container>
        </Modal>
      ) : (
        <FullscreenModal
          opened={opened}
          onClose={onClose}
          navbarRef={navbarRef}
          mobileNavbarRef={mobileNavbarRef}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Box padding="60px 0 0">
                <StyledButton
                  className={className}
                  icon="arrow-left-circle"
                  onClick={onClose}
                  buttonStyle="text"
                  iconSize="26px"
                  padding="0"
                  textDecorationHover="underline"
                >
                  Go back
                </StyledButton>
                {metaData && (
                  <StyledSignUpIn
                    metaData={metaData}
                    onSignUpInCompleted={onSignUpInCompleted}
                  />
                )}
              </Box>
              <Box width="100%">
                <PlatformFooter insideModal />
              </Box>
            </Box>
          </Box>
        </FullscreenModal>
      )}
    </>
  );
};

export default SignUpInModal;
