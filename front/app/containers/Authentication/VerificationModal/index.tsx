import React, { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isVerificationError } from 'containers/Authentication/VerificationModal/verificationModalEvents';
// components
import Modal from 'components/UI/Modal';
// TODO: Change when we move to container
import VerificationSteps from '../SignUpIn/SignUpInComponent/SignUp/VerificationSignUpStep/VerificationSteps';
import VerificationError from './VerificationError';
import VerificationSuccess from './VerificationSuccess';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';
import { useWindowSize } from '@citizenlab/cl2-component-library';

// events
import {
  ContextShape,
  IVerificationError,
  TVerificationStep,
  openVerificationModal$,
  closeVerificationModal$,
  closeVerificationModal,
} from './verificationModalEvents';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';
import ErrorBoundary from 'components/ErrorBoundary';
import useQuery from 'utils/cl-router/useQuery';

// typings
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 40px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;
`;

const VerificationModal = () => {
  const { windowWidth } = useWindowSize();
  const authUser = useAuthUser();
  const query = useQuery();
  const isMounted = useIsMounted();
  const mounted = isMounted();
  const [activeStep, setActiveStep] = useState<TVerificationStep>(null);
  const [context, setContext] = useState<ContextShape>(null);
  const [error, setError] = useState<IVerificationError | null>(null);
  const opened = !!activeStep;

  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;

  useEffect(() => {
    const subscriptions = [
      openVerificationModal$.subscribe(
        ({ eventValue: { step, context, error } }) => {
          setActiveStep(step);
          setContext(context);
          error && setError(error);
        }
      ),
      closeVerificationModal$.subscribe(() => {
        setActiveStep(null);
        setContext(null);
      }),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, []);

  const onClose = () => {
    closeVerificationModal();
  };

  const onCompleted = () => {
    setActiveStep('success');
    setContext(null);
  };

  const onError = () => {
    setActiveStep('error');
    setContext(null);
  };

  useEffect(() => {
    if (!isNilOrError(authUser) && mounted) {
      openVerificationModalIfSuccessOrError();
    }
  }, [authUser, mounted]);

  const openVerificationModalIfSuccessOrError = () => {
    // query.get returns the value, which is a string 'true'
    // for this param (search for it in the backend)
    if (query.get('verification_success') === 'true') {
      window.history.replaceState(null, '', window.location.pathname);
      setActiveStep('success');
    }

    // query.get returns the value, which is a string 'true'
    // for this param (search for it in the backend)
    if (query.get('verification_error') === 'true') {
      const error = query.get('error');

      window.history.replaceState(null, '', window.location.pathname);
      setActiveStep('error');
      if (typeof error === 'string' && isVerificationError(error)) {
        setError(error);
      }
      setContext(null);
    }
  };

  return (
    <ErrorBoundary>
      <Modal
        width={820}
        padding={
          smallerThanSmallTablet ? '0px 5px 0px 5px' : '0px 20px 0px 20px'
        }
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
      >
        <Container id="e2e-verification-modal">
          {activeStep && activeStep !== 'success' && activeStep !== 'error' && (
            <VerificationSteps
              context={context}
              inModal={true}
              showHeader={true}
              initialActiveStep={activeStep}
              onCompleted={onCompleted}
              onError={onError}
            />
          )}

          {activeStep === 'success' && (
            <VerificationSuccess onClose={onClose} />
          )}

          {activeStep === 'error' && error && (
            <VerificationError error={error} />
          )}
        </Container>
      </Modal>
    </ErrorBoundary>
  );
};

export default VerificationModal;
