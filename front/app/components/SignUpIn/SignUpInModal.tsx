import React, { useState, useEffect, memo } from 'react';
import { signOut } from 'services/auth';
import tracks from './tracks';

// components
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';
import FullscreenModal from 'components/UI/FullscreenModal';
import { Box } from '@citizenlab/cl2-component-library';
import PlatformFooter from 'containers/PlatformFooter';
import MainHeader from 'containers/MainHeader';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';

// events
import {
  closeSignUpInModal,
  openSignUpInModal$,
} from 'components/SignUpIn/events';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const StyledBox = styled(Box)`
  ${media.tablet`
      padding-top: ${(props) => props.theme.mobileTopBarHeight}px;
  `};
`;

const StyledSignUpIn = styled(SignUpIn)`
  display: flex;
  flex-direction: column;
  width: 580px;
`;

interface Props {
  className?: string;
  onMounted?: () => void;
  onDeclineInvitation?: () => void;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
}

const SignUpInModal = memo(
  ({ onMounted, onDeclineInvitation, navbarRef, mobileNavbarRef }: Props) => {
    const isMounted = useIsMounted();
    const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(
      undefined
    );
    const authUser = useAuthUser();
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

    return (
      <FullscreenModal
        opened={opened}
        onClose={onClose}
        navbarRef={navbarRef}
        mobileNavbarRef={mobileNavbarRef}
        url={getUrl()}
        topBar={<MainHeader />}
      >
        <StyledBox display="flex" flexDirection="column" alignItems="center">
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            {metaData && (
              <StyledSignUpIn
                metaData={metaData}
                onSignUpInCompleted={onSignUpInCompleted}
              />
            )}
            <Box width="100%">
              <PlatformFooter insideModal />
            </Box>
          </Box>
        </StyledBox>
      </FullscreenModal>
    );
  }
);

export default SignUpInModal;
