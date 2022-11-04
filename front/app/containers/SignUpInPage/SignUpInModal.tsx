import React, { useState, useEffect, memo } from 'react';
import { signOut } from 'services/auth';
import tracks from './tracks';
import messages from './messages';
// components
import SignUpIn, { ISignUpInMetaData } from './SignUpIn';
import FullscreenModal from 'components/UI/FullscreenModal';
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';
import PlatformFooter from 'containers/PlatformFooter';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';

// events
import { closeSignUpInModal, openSignUpInModal$ } from './events';
import PageContainer from 'components/UI/PageContainer';

interface Props {
  className?: string;
  onMounted?: () => void;
  onDeclineInvitation?: () => void;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
}

// Note: we also use SignUpInPage (when not clicking Log in/Sign up in the top navigation)
// This component looks the same.
const SignUpInModal = memo(
  ({ onMounted, onDeclineInvitation, navbarRef, mobileNavbarRef }: Props) => {
    const isMounted = useIsMounted();
    const [metaData, setMetaData] = useState<ISignUpInMetaData | null>(null);
    const authUser = useAuthUser();
    const { formatMessage } = useIntl();
    const opened = metaData?.inModal || false;

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

    const getUrl = () => {
      if (metaData) {
        const { flow } = metaData;

        if (flow === 'signin') {
          return '/sign-in';
        }

        if (flow === 'signup') {
          return '/sign-up';
        }
      }

      return null;
    };

    if (metaData) {
      return (
        <FullscreenModal
          opened={opened}
          onClose={onClose}
          navbarRef={navbarRef}
          mobileNavbarRef={mobileNavbarRef}
          url={getUrl()}
        >
          <>
            <PageContainer
              id="e2e-sign-up-in-modal"
              display="flex"
              justifyContent="center"
              background="#fff"
              padding={'40px 20px 20px'}
            >
              <Box
                maxWidth="580px"
                width="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Button
                  icon="arrow-left-circle"
                  onClick={onClose}
                  buttonStyle="text"
                  iconSize="26px"
                  padding="0"
                  textDecorationHover="underline"
                  mr="auto"
                  mb="20px"
                >
                  {formatMessage(messages.goBack)}
                </Button>
                <SignUpIn
                  metaData={metaData}
                  onSignUpInCompleted={onSignUpInCompleted}
                />
              </Box>
            </PageContainer>
            <PlatformFooter insideModal />
          </>
        </FullscreenModal>
      );
    }

    return null;
  }
);

export default SignUpInModal;
