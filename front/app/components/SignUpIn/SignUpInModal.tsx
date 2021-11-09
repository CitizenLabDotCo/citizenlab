import React, { memo, useState, useCallback, useEffect } from 'react';
import { isFunction } from 'lodash-es';

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
  openSignUpInModal$,
  signUpActiveStepChange$,
} from 'components/SignUpIn/events';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  className?: string;
  onMounted?: () => void;
}

const SignUpInModal = memo<Props>(({ className, onMounted }) => {
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

  const modalNoClose = !!(
    (metaData?.error !== true && signUpActiveStep === 'verification') ||
    (signUpActiveStep &&
      metaData?.modalNoCloseSteps?.includes(signUpActiveStep))
  );

  useEffect(() => {
    if (isMounted()) {
      onMounted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMounted]);

  useEffect(() => {
    const subscriptions = [
      openSignUpInModal$.subscribe(({ eventValue: metaData }) => {
        // don't overwrite metaData if already present!
        const isSignedIn = !isNilOrError(authUser);
        const isSignedInNeedsVerification =
          !isNilOrError(authUser) &&
          !authUser.attributes.verified &&
          metaData.verification;

        if (!isSignedIn || isSignedInNeedsVerification) {
          setMetaData((prevMetaData) =>
            prevMetaData ? prevMetaData : metaData
          );
        }
      }),
      signUpActiveStepChange$.subscribe(({ eventValue: activeStep }) => {
        setSignUpActiveStep(activeStep);
      }),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [authUser]);

  const onClose = () => {
    setMetaData(undefined);
  };

  const onSignUpInCompleted = useCallback(() => {
    const hasAction = isFunction(metaData?.action);
    const requiresVerification = !!metaData?.verification;
    const authUserIsVerified =
      !isNilOrError(authUser) && authUser.attributes.verified;

    if (hasAction && (!requiresVerification || authUserIsVerified)) {
      metaData?.action?.();
    }

    setMetaData(undefined);
  }, [metaData, authUser]);

  return (
    <Modal
      width={modalWidth}
      padding="0px"
      opened={opened}
      close={onClose}
      closeOnClickOutside={false}
      noClose={modalNoClose}
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
});

export default SignUpInModal;
